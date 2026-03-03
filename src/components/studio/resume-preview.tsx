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
  originalText: string;
}

interface Props {
  onContentChange: (resumeId: string, content: ResumeContent) => void;
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

function replaceFirstFieldMatch(content: ResumeContent, targetText: string, nextText: string) {
  const target = normalizeText(targetText);
  if (!target || target.length < MIN_EDITABLE_TEXT_LENGTH) {
    return { changed: false, content };
  }

  let changed = false;

  const replaceValue = (value: string) => {
    if (changed) return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    if (trimmed === target) {
      changed = true;
      return nextText;
    }

    if (target.length >= 4 && value.includes(target)) {
      changed = true;
      return value.replace(target, nextText);
    }

    const normalizedValue = normalizeText(value);
    if (target.length >= 4 && normalizedValue.includes(target)) {
      changed = true;
      return normalizedValue.replace(target, nextText);
    }

    return value;
  };

  const updated: ResumeContent = {
    summary: replaceValue(content.summary),
    workExperience: content.workExperience.map((job) => ({
      ...job,
      company: replaceValue(job.company),
      position: replaceValue(job.position),
      location: replaceValue(job.location || ''),
      startDate: replaceValue(job.startDate),
      endDate: replaceValue(job.endDate || ''),
      bullets: job.bullets.map((bullet) => replaceValue(bullet)),
    })),
    education: content.education.map((education) => ({
      ...education,
      institution: replaceValue(education.institution),
      degree: replaceValue(education.degree),
      field: replaceValue(education.field),
      startDate: replaceValue(education.startDate),
      endDate: replaceValue(education.endDate || ''),
      details: education.details?.map((detail) => replaceValue(detail)),
    })),
    projects: content.projects.map((project) => ({
      ...project,
      name: replaceValue(project.name),
      description: replaceValue(project.description),
      url: replaceValue(project.url || ''),
      technologies: project.technologies.map((tech) => replaceValue(tech)),
    })),
    skills: content.skills.map((skill) => replaceValue(skill)),
  };

  return { changed, content: updated };
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

export function ResumePreview({ onContentChange }: Props) {
  const activeResume = useAtomValue(activeResumeAtom);
  const profiles = useAtomValue(profilesAtom);

  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<EditingLine | null>(null);
  const [lineDraft, setLineDraft] = useState('');

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

  function applyContentChange(updater: (content: ResumeContent) => ResumeContent) {
    if (!activeResume) return;
    onContentChange(activeResume.id, updater(activeResume.content));
  }

  useEffect(() => {
    if (!renderPayload) {
      setPages([]);
      setRendering(false);
      setError(null);
      setEditingLine(null);
      setLineDraft('');
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
            setEditingLine(null);
            setLineDraft('');
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
    if (!editingLine || !activeResume) {
      setEditingLine(null);
      setLineDraft('');
      return;
    }

    const draftValue = nextDraft ?? lineDraft;
    const trimmedDraft = draftValue.trim();
    if (!trimmedDraft) {
      setEditingLine(null);
      setLineDraft('');
      return;
    }

    const { changed, content } = replaceFirstFieldMatch(
      activeResume.content,
      editingLine.originalText,
      trimmedDraft
    );

    if (changed) {
      onContentChange(activeResume.id, content);
    }

    setEditingLine(null);
    setLineDraft('');
  }

  function quickAddBlock(kind: 'experience' | 'education' | 'project' | 'skill') {
    applyContentChange((content) => {
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
    applyContentChange((content) => {
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

    applyContentChange((content) => {
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
    applyContentChange((content) => ({
      ...content,
      workExperience: content.workExperience.map((experience, itemIndex) =>
        itemIndex === index
          ? { ...experience, bullets: [...experience.bullets, 'New bullet'] }
          : experience
      ),
    }));
  }

  function addEducationDetail(index: number) {
    applyContentChange((content) => ({
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
    <div className="h-full overflow-auto rounded border border-border bg-surface p-4">
      <p className="mb-3 font-mono text-[10px] text-text-dim">
        Click a text line on the canvas to edit directly.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
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
      <div className="mb-4 space-y-3 rounded border border-dashed border-border-dashed p-2">
        <p className="font-mono text-[10px] text-text-dim">
          Block controls: delete, reorder, and quick bullet/detail add.
        </p>

        <div className="space-y-2">
          <p className="annotation">experience blocks</p>
          {activeResume.content.workExperience.length === 0 ? (
            <p className="font-mono text-[10px] text-text-dim">No experience blocks.</p>
          ) : (
            activeResume.content.workExperience.map((experience, index) => (
              <div
                key={`experience-${index}`}
                className="flex flex-wrap items-center gap-1 rounded border border-border-dashed bg-surface-raised/20 p-1.5"
              >
                <span className="max-w-[24rem] truncate pr-2 font-mono text-[10px] text-text-muted">
                  {index + 1}. {[experience.position, experience.company].filter(Boolean).join(' @ ') || 'Untitled'}
                </span>
                <Button variant="ghost" size="sm" type="button" disabled={index === 0} onClick={() => moveBlock('experience', index, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={index === activeResume.content.workExperience.length - 1}
                  onClick={() => moveBlock('experience', index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="sm" type="button" onClick={() => addExperienceBullet(index)}>
                  <Plus className="h-3 w-3" />
                  Bullet
                </Button>
                <Button variant="danger" size="sm" type="button" onClick={() => deleteBlock('experience', index)}>
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="annotation">education blocks</p>
          {activeResume.content.education.length === 0 ? (
            <p className="font-mono text-[10px] text-text-dim">No education blocks.</p>
          ) : (
            activeResume.content.education.map((education, index) => (
              <div
                key={`education-${index}`}
                className="flex flex-wrap items-center gap-1 rounded border border-border-dashed bg-surface-raised/20 p-1.5"
              >
                <span className="max-w-[24rem] truncate pr-2 font-mono text-[10px] text-text-muted">
                  {index + 1}. {[education.degree, education.institution].filter(Boolean).join(' @ ') || 'Untitled'}
                </span>
                <Button variant="ghost" size="sm" type="button" disabled={index === 0} onClick={() => moveBlock('education', index, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={index === activeResume.content.education.length - 1}
                  onClick={() => moveBlock('education', index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="sm" type="button" onClick={() => addEducationDetail(index)}>
                  <Plus className="h-3 w-3" />
                  Detail
                </Button>
                <Button variant="danger" size="sm" type="button" onClick={() => deleteBlock('education', index)}>
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="annotation">project blocks</p>
          {activeResume.content.projects.length === 0 ? (
            <p className="font-mono text-[10px] text-text-dim">No project blocks.</p>
          ) : (
            activeResume.content.projects.map((project, index) => (
              <div
                key={`project-${index}`}
                className="flex flex-wrap items-center gap-1 rounded border border-border-dashed bg-surface-raised/20 p-1.5"
              >
                <span className="max-w-[24rem] truncate pr-2 font-mono text-[10px] text-text-muted">
                  {index + 1}. {project.name || 'Untitled'}
                </span>
                <Button variant="ghost" size="sm" type="button" disabled={index === 0} onClick={() => moveBlock('project', index, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={index === activeResume.content.projects.length - 1}
                  onClick={() => moveBlock('project', index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button variant="danger" size="sm" type="button" onClick={() => deleteBlock('project', index)}>
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <p className="annotation">skills</p>
          {activeResume.content.skills.length === 0 ? (
            <p className="font-mono text-[10px] text-text-dim">No skills yet.</p>
          ) : (
            activeResume.content.skills.map((skill, index) => (
              <div
                key={`skill-${index}`}
                className="flex flex-wrap items-center gap-1 rounded border border-border-dashed bg-surface-raised/20 p-1.5"
              >
                <span className="max-w-[24rem] truncate pr-2 font-mono text-[10px] text-text-muted">
                  {index + 1}. {skill || 'Untitled'}
                </span>
                <Button variant="ghost" size="sm" type="button" disabled={index === 0} onClick={() => moveBlock('skill', index, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={index === activeResume.content.skills.length - 1}
                  onClick={() => moveBlock('skill', index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button variant="danger" size="sm" type="button" onClick={() => deleteBlock('skill', index)}>
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

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

            <div className="pointer-events-none absolute inset-0">
              {page.lines.map((line) => {
                const isEditing = editingLine
                  && editingLine.pageIndex === pageIndex
                  && editingLine.lineId === line.id;

                return (
                  <div key={line.id} className="absolute" style={{ left: `${line.x}px`, top: `${line.y}px` }}>
                    {!isEditing && (
                      <button
                        type="button"
                        className="pointer-events-auto block rounded-sm border border-transparent bg-transparent transition-colors hover:border-accent/50 hover:bg-accent/10"
                        style={{ width: `${line.width}px`, height: `${line.height}px` }}
                        title={line.text}
                        onClick={() => {
                          setEditingLine({
                            pageIndex,
                            lineId: line.id,
                            originalText: line.text,
                          });
                          setLineDraft(line.text);
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
                            setEditingLine(null);
                            setLineDraft('');
                            return;
                          }

                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            commitLineEdit(event.currentTarget.value);
                          }
                        }}
                      />
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
