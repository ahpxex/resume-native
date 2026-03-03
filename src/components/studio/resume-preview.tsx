import { useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { activeResumeAtom } from '../../store/resumes';
import { profilesAtom } from '../../store/profiles';
import { templateRegistry } from '../../templates/registry';
import { buildResumePdfBlob } from '../../lib/resume-pdf';
import { Button } from '../ui/button';
import type { ResumeContent } from '../../types';

const PREVIEW_PAGE_WIDTH = 980;
const PREVIEW_RENDER_DEBOUNCE_MS = 280;
const MIN_EDITABLE_TEXT_LENGTH = 2;

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PreviewPage {
  imageSrc: string;
  width: number;
  height: number;
  lines: TextLine[];
}

interface TextLine {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PdfTextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface EditingLine {
  pageIndex: number;
  lineId: string;
  fieldRef: EditableFieldRef | null;
}

type BlockContext =
  | { kind: 'experience'; index: number }
  | { kind: 'education'; index: number }
  | { kind: 'project'; index: number }
  | { kind: 'skill'; index: number };

type EditableFieldRef =
  | { kind: 'summary' }
  | { kind: 'experience'; index: number; field: 'company' | 'position' | 'location' | 'startDate' | 'endDate' }
  | { kind: 'experienceBullet'; index: number; bulletIndex: number }
  | { kind: 'education'; index: number; field: 'institution' | 'degree' | 'field' | 'startDate' | 'endDate' }
  | { kind: 'educationDetail'; index: number; detailIndex: number }
  | { kind: 'project'; index: number; field: 'name' | 'description' | 'url' }
  | { kind: 'projectTechnology'; index: number; technologyIndex: number }
  | { kind: 'skill'; index: number };

interface ActiveLineContext {
  pageIndex: number;
  lineId: string;
  blockContext: BlockContext | null;
}

interface Props {
  onContentChange: (resumeId: string, updater: (content: ResumeContent) => ResumeContent) => void;
}

function isPdfTextItemLike(item: unknown): item is PdfTextItemLike {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Partial<PdfTextItemLike>;
  return (
    typeof candidate.str === 'string'
    && Array.isArray(candidate.transform)
    && typeof candidate.width === 'number'
    && typeof candidate.height === 'number'
  );
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeMatchText(value: string) {
  return normalizeText(value).replace(/^[•*\\-]\\s*/, '').toLowerCase();
}

function getTextMatchScore(value: string, target: string) {
  const left = normalizeMatchText(value);
  const right = normalizeMatchText(target);

  if (!left || !right) return 0;
  if (left === right) return 3;
  if (right.length >= 4 && left.includes(right)) return 2;
  if (left.length >= 4 && right.includes(left)) return 1;
  return 0;
}

function createQuickAddExperience() {
  return {
    company: 'New Company',
    position: 'New Role',
    location: '',
    startDate: '2024-01',
    endDate: 'Present',
    bullets: ['Add a measurable impact bullet.'],
  };
}

function createQuickAddEducation() {
  return {
    institution: 'New School',
    degree: 'Degree',
    field: 'Field of Study',
    startDate: '2020',
    endDate: '2024',
    details: ['Add a relevant highlight.'],
  };
}

function createQuickAddProject() {
  return {
    name: 'New Project',
    description: 'Describe the project impact in one sentence.',
    technologies: ['React'],
    url: '',
  };
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0
    || fromIndex >= items.length
    || toIndex < 0
    || toIndex >= items.length
    || fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  if (item === undefined) return items;
  next.splice(toIndex, 0, item);
  return next;
}

function getBlockContextFromFieldRef(fieldRef: EditableFieldRef | null): BlockContext | null {
  if (!fieldRef || fieldRef.kind === 'summary') return null;
  if (fieldRef.kind === 'experience' || fieldRef.kind === 'experienceBullet') {
    return { kind: 'experience', index: fieldRef.index };
  }
  if (fieldRef.kind === 'education' || fieldRef.kind === 'educationDetail') {
    return { kind: 'education', index: fieldRef.index };
  }
  if (fieldRef.kind === 'project' || fieldRef.kind === 'projectTechnology') {
    return { kind: 'project', index: fieldRef.index };
  }
  return { kind: 'skill', index: fieldRef.index };
}

interface EditableFieldCandidate {
  fieldRef: EditableFieldRef;
  value: string;
}

function listEditableFieldCandidates(content: ResumeContent): EditableFieldCandidate[] {
  const candidates: EditableFieldCandidate[] = [];
  candidates.push({ fieldRef: { kind: 'summary' }, value: content.summary });

  content.workExperience.forEach((experience, index) => {
    candidates.push({ fieldRef: { kind: 'experience', index, field: 'company' }, value: experience.company });
    candidates.push({ fieldRef: { kind: 'experience', index, field: 'position' }, value: experience.position });
    candidates.push({ fieldRef: { kind: 'experience', index, field: 'location' }, value: experience.location || '' });
    candidates.push({ fieldRef: { kind: 'experience', index, field: 'startDate' }, value: experience.startDate });
    candidates.push({ fieldRef: { kind: 'experience', index, field: 'endDate' }, value: experience.endDate || '' });
    experience.bullets.forEach((bullet, bulletIndex) => {
      candidates.push({
        fieldRef: { kind: 'experienceBullet', index, bulletIndex },
        value: bullet,
      });
    });
  });

  content.education.forEach((education, index) => {
    candidates.push({ fieldRef: { kind: 'education', index, field: 'institution' }, value: education.institution });
    candidates.push({ fieldRef: { kind: 'education', index, field: 'degree' }, value: education.degree });
    candidates.push({ fieldRef: { kind: 'education', index, field: 'field' }, value: education.field });
    candidates.push({ fieldRef: { kind: 'education', index, field: 'startDate' }, value: education.startDate });
    candidates.push({ fieldRef: { kind: 'education', index, field: 'endDate' }, value: education.endDate || '' });
    (education.details ?? []).forEach((detail, detailIndex) => {
      candidates.push({
        fieldRef: { kind: 'educationDetail', index, detailIndex },
        value: detail,
      });
    });
  });

  content.projects.forEach((project, index) => {
    candidates.push({ fieldRef: { kind: 'project', index, field: 'name' }, value: project.name });
    candidates.push({ fieldRef: { kind: 'project', index, field: 'description' }, value: project.description });
    candidates.push({ fieldRef: { kind: 'project', index, field: 'url' }, value: project.url || '' });
    project.technologies.forEach((technology, technologyIndex) => {
      candidates.push({
        fieldRef: { kind: 'projectTechnology', index, technologyIndex },
        value: technology,
      });
    });
  });

  content.skills.forEach((skill, index) => {
    candidates.push({ fieldRef: { kind: 'skill', index }, value: skill });
  });

  return candidates;
}

function findEditableFieldRef(
  content: ResumeContent,
  targetText: string,
  occurrence: number
): EditableFieldRef | null {
  const matches = listEditableFieldCandidates(content)
    .map((candidate) => ({
      ...candidate,
      score: getTextMatchScore(candidate.value, targetText),
    }))
    .filter((candidate) => candidate.score > 0);

  if (matches.length === 0) return null;

  const strongestScore = Math.max(...matches.map((candidate) => candidate.score));
  const strongestMatches = matches.filter((candidate) => candidate.score === strongestScore);
  const boundedOccurrence = Math.max(0, Math.min(occurrence, strongestMatches.length - 1));
  return strongestMatches[boundedOccurrence]?.fieldRef ?? strongestMatches[0]?.fieldRef ?? null;
}

function replaceByIndex<T>(items: T[], index: number, updater: (item: T) => T) {
  if (index < 0 || index >= items.length) return items;
  const nextItem = updater(items[index] as T);
  if (nextItem === items[index]) return items;
  const next = [...items];
  next[index] = nextItem;
  return next;
}

function applyFieldRefEdit(content: ResumeContent, fieldRef: EditableFieldRef, nextText: string) {
  if (nextText.length < MIN_EDITABLE_TEXT_LENGTH) {
    return { changed: false, content };
  }

  if (fieldRef.kind === 'summary') {
    if (content.summary === nextText) return { changed: false, content };
    return { changed: true, content: { ...content, summary: nextText } };
  }

  if (fieldRef.kind === 'experience') {
    const list = replaceByIndex(content.workExperience, fieldRef.index, (experience) => {
      if (experience[fieldRef.field] === nextText) return experience;
      return { ...experience, [fieldRef.field]: nextText };
    });

    if (list === content.workExperience) return { changed: false, content };
    return { changed: true, content: { ...content, workExperience: list } };
  }

  if (fieldRef.kind === 'experienceBullet') {
    const list = replaceByIndex(content.workExperience, fieldRef.index, (experience) => {
      const bullets = replaceByIndex(experience.bullets, fieldRef.bulletIndex, (bullet) =>
        bullet === nextText ? bullet : nextText
      );
      if (bullets === experience.bullets) return experience;
      return { ...experience, bullets };
    });

    if (list === content.workExperience) return { changed: false, content };
    return { changed: true, content: { ...content, workExperience: list } };
  }

  if (fieldRef.kind === 'education') {
    const list = replaceByIndex(content.education, fieldRef.index, (education) => {
      if (education[fieldRef.field] === nextText) return education;
      return { ...education, [fieldRef.field]: nextText };
    });

    if (list === content.education) return { changed: false, content };
    return { changed: true, content: { ...content, education: list } };
  }

  if (fieldRef.kind === 'educationDetail') {
    const list = replaceByIndex(content.education, fieldRef.index, (education) => {
      const details = education.details ?? [];
      const nextDetails = replaceByIndex(details, fieldRef.detailIndex, (detail) =>
        detail === nextText ? detail : nextText
      );
      if (nextDetails === details) return education;
      return { ...education, details: nextDetails };
    });

    if (list === content.education) return { changed: false, content };
    return { changed: true, content: { ...content, education: list } };
  }

  if (fieldRef.kind === 'project') {
    const list = replaceByIndex(content.projects, fieldRef.index, (project) => {
      if (project[fieldRef.field] === nextText) return project;
      return { ...project, [fieldRef.field]: nextText };
    });

    if (list === content.projects) return { changed: false, content };
    return { changed: true, content: { ...content, projects: list } };
  }

  if (fieldRef.kind === 'projectTechnology') {
    const list = replaceByIndex(content.projects, fieldRef.index, (project) => {
      const technologies = replaceByIndex(project.technologies, fieldRef.technologyIndex, (technology) =>
        technology === nextText ? technology : nextText
      );
      if (technologies === project.technologies) return project;
      return { ...project, technologies };
    });

    if (list === content.projects) return { changed: false, content };
    return { changed: true, content: { ...content, projects: list } };
  }

  const nextSkills = replaceByIndex(content.skills, fieldRef.index, (skill) =>
    skill === nextText ? skill : nextText
  );

  if (nextSkills === content.skills) return { changed: false, content };
  return { changed: true, content: { ...content, skills: nextSkills } };
}

function buildTextLines(
  pageNumber: number,
  items: unknown[],
  viewport: { scale: number; convertToViewportPoint: (x: number, y: number) => number[] }
) {
  const buckets = new Map<number, Array<{ x: number; width: number; text: string; height: number }>>();

  for (const item of items) {
    if (!isPdfTextItemLike(item)) continue;

    const text = item.str.trim();
    if (!text) continue;

    const [xRaw, yRaw] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
    const x = Number(xRaw) || 0;
    const y = Number(yRaw) || 0;
    const itemHeight = Math.max(8, Math.abs(item.transform[3] * viewport.scale));
    const top = y - itemHeight;
    const width = Math.max(itemHeight * 0.6, item.width * viewport.scale);

    const rowKey = Math.round(top / 3);
    const row = buckets.get(rowKey) ?? [];
    row.push({ x, width, text, height: itemHeight * 1.25 });
    buckets.set(rowKey, row);
  }

  const rows = Array.from(buckets.entries()).sort(([a], [b]) => a - b);

  return rows
    .map(([rowKey, rowItems], rowIndex) => {
      const sorted = [...rowItems].sort((a, b) => a.x - b.x);

      let mergedText = '';
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxHeight = 16;
      let previousEnd = 0;

      for (const item of sorted) {
        if (mergedText && item.x - previousEnd > 3) {
          mergedText += ' ';
        }

        mergedText += item.text;
        minX = Math.min(minX, item.x);
        maxX = Math.max(maxX, item.x + item.width);
        maxHeight = Math.max(maxHeight, item.height);
        previousEnd = item.x + item.width;
      }

      const normalized = normalizeText(mergedText);
      if (normalized.length < MIN_EDITABLE_TEXT_LENGTH) return null;

      return {
        id: `${pageNumber}-${rowIndex}`,
        text: normalized,
        x: minX,
        y: rowKey * 3,
        width: Math.max(6, maxX - minX),
        height: maxHeight,
      } satisfies TextLine;
    })
    .filter((line): line is TextLine => Boolean(line));
}

function getLineOccurrence(pages: PreviewPage[], pageIndex: number, lineId: string, lineText: string) {
  const targetText = normalizeMatchText(lineText);
  let occurrence = 0;

  for (let currentPageIndex = 0; currentPageIndex <= pageIndex; currentPageIndex += 1) {
    const page = pages[currentPageIndex];
    if (!page) continue;

    for (const line of page.lines) {
      if (normalizeMatchText(line.text) !== targetText) continue;

      if (currentPageIndex === pageIndex && line.id === lineId) {
        return occurrence;
      }

      occurrence += 1;
    }
  }

  return occurrence;
}

export function ResumePreview({ onContentChange }: Props) {
  const activeResume = useAtomValue(activeResumeAtom);
  const profiles = useAtomValue(profilesAtom);

  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);
  const [lineDraft, setLineDraft] = useState('');
  const [activeLineContext, setActiveLineContext] = useState<ActiveLineContext | null>(null);

  const profile = activeResume
    ? profiles.find((candidate) => candidate.id === activeResume.profileId)
    : null;
  const template = activeResume
    ? templateRegistry[activeResume.templateId]
    : null;

  const renderPayload = useMemo(() => {
    if (!activeResume || !profile || !template) return null;

    return {
      resumeId: activeResume.id,
      content: activeResume.content,
      personalInfo: profile.personalInfo,
      templateComponent: template.component,
    };
  }, [activeResume, profile, template]);

  function clearLineEditing() {
    setEditingLine(null);
    setLineDraft('');
    setActiveLineContext(null);
  }

  function applyContentChange(updater: (content: ResumeContent) => ResumeContent) {
    if (!activeResume) return;
    onContentChange(activeResume.id, updater);
  }

  function applyContentChangeWithPendingLineEdit(
    updater: (content: ResumeContent) => ResumeContent
  ) {
    const editingSnapshot = editingLine;
    const draftSnapshot = lineDraft.trim();

    applyContentChange((content) => {
      const baseContent = editingSnapshot?.fieldRef && draftSnapshot
        ? applyFieldRefEdit(content, editingSnapshot.fieldRef, draftSnapshot).content
        : content;
      return updater(baseContent);
    });

    clearLineEditing();
  }

  useEffect(() => {
    if (!renderPayload) {
      setPages([]);
      setRendering(false);
      setError(null);
      clearLineEditing();
      return;
    }

    const currentPayload = renderPayload;
    let cancelled = false;

    async function renderCanvasPreview() {
      setRendering(true);
      setError(null);

      try {
        const blob = await buildResumePdfBlob({
          template: currentPayload.templateComponent,
          personalInfo: currentPayload.personalInfo,
          content: currentPayload.content,
        });

        const bytes = await blob.arrayBuffer();
        const loadingTask = getDocument({ data: bytes });
        const pdfDocument = await loadingTask.promise;

        try {
          const nextPages: PreviewPage[] = [];

          for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
            if (cancelled) break;

            const page = await pdfDocument.getPage(pageNumber);
            const baseViewport = page.getViewport({ scale: 1 });
            const scale = PREVIEW_PAGE_WIDTH / baseViewport.width;
            const viewport = page.getViewport({ scale });
            const dpiScale = window.devicePixelRatio || 1;

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width * dpiScale);
            canvas.height = Math.floor(viewport.height * dpiScale);

            const context = canvas.getContext('2d');
            if (!context) {
              throw new Error('Failed to create preview canvas context.');
            }

            context.setTransform(dpiScale, 0, 0, dpiScale, 0, 0);
            await page.render({ canvas, canvasContext: context, viewport }).promise;

            const textContent = await page.getTextContent();
            const lines = buildTextLines(pageNumber, textContent.items, viewport);

            nextPages.push({
              imageSrc: canvas.toDataURL('image/png'),
              width: viewport.width,
              height: viewport.height,
              lines,
            });
          }

          if (!cancelled) {
            setPages(nextPages);
            clearLineEditing();
          }
        } finally {
          await pdfDocument.destroy();
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : 'Failed to render preview');
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void renderCanvasPreview();
    }, PREVIEW_RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [renderPayload]);

  function commitLineEdit(nextDraft?: string) {
    if (!editingLine) {
      clearLineEditing();
      return;
    }

    const draftValue = nextDraft ?? lineDraft;
    const trimmedDraft = draftValue.trim();
    if (!trimmedDraft) {
      clearLineEditing();
      return;
    }

    const editingSnapshot = editingLine;
    applyContentChange((content) =>
      editingSnapshot.fieldRef
        ? applyFieldRefEdit(content, editingSnapshot.fieldRef, trimmedDraft).content
        : content
    );
    clearLineEditing();
  }

  function quickAddBlock(kind: 'experience' | 'education' | 'project' | 'skill') {
    applyContentChangeWithPendingLineEdit((content) => {
      if (kind === 'experience') {
        return {
          ...content,
          workExperience: [...content.workExperience, createQuickAddExperience()],
        };
      }

      if (kind === 'education') {
        return {
          ...content,
          education: [...content.education, createQuickAddEducation()],
        };
      }

      if (kind === 'project') {
        return {
          ...content,
          projects: [...content.projects, createQuickAddProject()],
        };
      }

      return {
        ...content,
        skills: [...content.skills, 'New Skill'],
      };
    });
  }

  function deleteBlock(kind: 'experience' | 'education' | 'project' | 'skill', index: number) {
    applyContentChangeWithPendingLineEdit((content) => {
      if (kind === 'experience') {
        return {
          ...content,
          workExperience: content.workExperience.filter((_, itemIndex) => itemIndex !== index),
        };
      }

      if (kind === 'education') {
        return {
          ...content,
          education: content.education.filter((_, itemIndex) => itemIndex !== index),
        };
      }

      if (kind === 'project') {
        return {
          ...content,
          projects: content.projects.filter((_, itemIndex) => itemIndex !== index),
        };
      }

      return {
        ...content,
        skills: content.skills.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  function moveBlock(kind: 'experience' | 'education' | 'project' | 'skill', index: number, direction: -1 | 1) {
    const toIndex = index + direction;

    applyContentChangeWithPendingLineEdit((content) => {
      if (kind === 'experience') {
        return {
          ...content,
          workExperience: moveArrayItem(content.workExperience, index, toIndex),
        };
      }

      if (kind === 'education') {
        return {
          ...content,
          education: moveArrayItem(content.education, index, toIndex),
        };
      }

      if (kind === 'project') {
        return {
          ...content,
          projects: moveArrayItem(content.projects, index, toIndex),
        };
      }

      return {
        ...content,
        skills: moveArrayItem(content.skills, index, toIndex),
      };
    });
  }

  function addExperienceBullet(index: number) {
    applyContentChangeWithPendingLineEdit((content) => ({
      ...content,
      workExperience: content.workExperience.map((experience, itemIndex) =>
        itemIndex === index
          ? { ...experience, bullets: [...experience.bullets, 'New bullet'] }
          : experience
      ),
    }));
  }

  function addEducationDetail(index: number) {
    applyContentChangeWithPendingLineEdit((content) => ({
      ...content,
      education: content.education.map((education, itemIndex) =>
        itemIndex === index
          ? { ...education, details: [...(education.details ?? []), 'New detail'] }
          : education
      ),
    }));
  }

  if (!activeResume) {
    return (
      <div className="flex h-full items-center justify-center rounded border border-dashed border-border-dashed bg-surface">
        <div className="text-center">
          <p className="annotation mb-1">no preview</p>
          <p className="font-mono text-[10px] text-text-dim">
            Generate a resume to see it here.
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !template) return null;

  return (
    <div className="h-full overflow-auto rounded border border-border bg-surface p-4 flex flex-col">
      <p className="mb-3 font-mono text-[10px] text-text-dim">
        Click a text line on the canvas to edit directly.
      </p>
      {rendering && (
        <p className="mb-3 font-mono text-[10px] text-text-dim">
          {pages.length > 0 ? 'Updating preview...' : 'Rendering canvas preview...'}
        </p>
      )}
      {error && <p className="mb-3 font-mono text-[10px] text-danger">{error}</p>}
      {!rendering && !error && pages.length === 0 && (
        <p className="mb-3 font-mono text-[10px] text-text-dim">No preview pages were generated.</p>
      )}

      <div className="space-y-4">
        {pages.map((page, pageIndex) => (
          <div
            key={`${pageIndex}-${page.imageSrc.length}`}
            className="relative mx-auto w-fit border border-border-dashed bg-white shadow-sm"
            style={{ width: `${page.width}px`, minWidth: `${page.width}px` }}
          >
            <img
              src={page.imageSrc}
              alt={`Resume page ${pageIndex + 1}`}
              className="block h-auto"
              style={{ width: `${page.width}px`, height: `${page.height}px` }}
            />

            {pageIndex === 0 && (
              <div className="pointer-events-auto absolute right-2 top-2 z-20 flex flex-wrap gap-1 rounded border border-border-dashed bg-surface/95 p-1 backdrop-blur">
                <Button size="sm" variant="secondary" type="button" onClick={() => quickAddBlock('experience')}>
                  <Plus className="h-3 w-3" />
                  Experience
                </Button>
                <Button size="sm" variant="secondary" type="button" onClick={() => quickAddBlock('education')}>
                  <Plus className="h-3 w-3" />
                  Education
                </Button>
                <Button size="sm" variant="secondary" type="button" onClick={() => quickAddBlock('project')}>
                  <Plus className="h-3 w-3" />
                  Project
                </Button>
                <Button size="sm" variant="secondary" type="button" onClick={() => quickAddBlock('skill')}>
                  <Plus className="h-3 w-3" />
                  Skill
                </Button>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0">
              {page.lines.map((line) => {
                const isEditing = editingLine
                  && editingLine.pageIndex === pageIndex
                  && editingLine.lineId === line.id;
                const selectedBlockContext = activeLineContext
                  && activeLineContext.pageIndex === pageIndex
                  && activeLineContext.lineId === line.id
                  ? activeLineContext.blockContext
                  : null;

                return (
                  <div key={line.id} className="absolute" style={{ left: `${line.x}px`, top: `${line.y}px` }}>
                    {!isEditing && (
                      <button
                        type="button"
                        className="pointer-events-auto block rounded-sm border border-transparent bg-transparent transition-colors hover:border-accent/50 hover:bg-accent/10"
                        style={{ width: `${line.width}px`, height: `${line.height}px` }}
                        title={line.text}
                        onClick={() => {
                          const occurrence = getLineOccurrence(pages, pageIndex, line.id, line.text);
                          const fieldRef = findEditableFieldRef(activeResume.content, line.text, occurrence);

                          setEditingLine({
                            pageIndex,
                            lineId: line.id,
                            fieldRef,
                          });
                          setLineDraft(line.text);
                          setActiveLineContext({
                            pageIndex,
                            lineId: line.id,
                            blockContext: getBlockContextFromFieldRef(fieldRef),
                          });
                        }}
                      />
                    )}

                    {isEditing && (
                      <textarea
                        autoFocus
                        value={lineDraft}
                        className="pointer-events-auto rounded border border-accent/60 bg-surface px-1 py-0.5 font-mono text-[11px] text-text shadow-sm outline-none"
                        style={{
                          width: `${Math.max(line.width, 220)}px`,
                          minHeight: `${Math.max(line.height, 24)}px`,
                        }}
                        onChange={(event) => setLineDraft(event.target.value)}
                        onBlur={(event) => commitLineEdit(event.currentTarget.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            clearLineEditing();
                            return;
                          }

                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            commitLineEdit(event.currentTarget.value);
                          }
                        }}
                      />
                    )}

                    {isEditing && selectedBlockContext && (
                      <div
                        className="pointer-events-auto mt-1 flex flex-wrap gap-1 rounded border border-border-dashed bg-surface/95 p-1 shadow-sm backdrop-blur"
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {(selectedBlockContext.kind === 'experience' || selectedBlockContext.kind === 'education' || selectedBlockContext.kind === 'project' || selectedBlockContext.kind === 'skill') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              disabled={selectedBlockContext.index === 0}
                              onClick={() => moveBlock(selectedBlockContext.kind, selectedBlockContext.index, -1)}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              disabled={selectedBlockContext.index === (
                                selectedBlockContext.kind === 'experience'
                                  ? activeResume.content.workExperience.length - 1
                                  : selectedBlockContext.kind === 'education'
                                    ? activeResume.content.education.length - 1
                                    : selectedBlockContext.kind === 'project'
                                      ? activeResume.content.projects.length - 1
                                      : activeResume.content.skills.length - 1
                              )}
                              onClick={() => moveBlock(selectedBlockContext.kind, selectedBlockContext.index, 1)}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </>
                        )}

                        {selectedBlockContext.kind === 'experience' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => addExperienceBullet(selectedBlockContext.index)}
                          >
                            <Plus className="h-3 w-3" />
                            Bullet
                          </Button>
                        )}

                        {selectedBlockContext.kind === 'education' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => addEducationDetail(selectedBlockContext.index)}
                          >
                            <Plus className="h-3 w-3" />
                            Detail
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          type="button"
                          onClick={() => deleteBlock(selectedBlockContext.kind, selectedBlockContext.index)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
