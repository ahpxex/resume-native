import { useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { activeResumeAtom } from '../../store/resumes';
import { profilesAtom } from '../../store/profiles';
import { templateRegistry } from '../../templates/registry';
import { buildResumePdfBlob } from '../../lib/resume-pdf';

const PREVIEW_PAGE_WIDTH = 980;
const PREVIEW_RENDER_DEBOUNCE_MS = 320;

GlobalWorkerOptions.workerSrc = pdfWorker;

export function ResumePreview() {
  const activeResume = useAtomValue(activeResumeAtom);
  const profiles = useAtomValue(profilesAtom);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = activeResume
    ? profiles.find((p) => p.id === activeResume.profileId)
    : null;
  const template = activeResume
    ? templateRegistry[activeResume.templateId]
    : null;

  const renderPayload = useMemo(() => {
    if (!activeResume || !profile || !template) return null;
    return {
      content: activeResume.content,
      personalInfo: profile.personalInfo,
      templateComponent: template.component,
    };
  }, [activeResume, profile, template]);

  useEffect(() => {
    if (!renderPayload) {
      setPageImages([]);
      setRendering(false);
      setError(null);
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
          const nextImages: string[] = [];

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
            nextImages.push(canvas.toDataURL('image/png'));
          }

          if (!cancelled && nextImages.length > 0) {
            setPageImages(nextImages);
          }
        } finally {
          await pdfDocument.destroy();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to render preview');
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
    <div className="h-full overflow-y-auto rounded border border-border bg-surface p-4">
      {rendering && (
        <p className="mb-3 font-mono text-[10px] text-text-dim">
          {pageImages.length > 0 ? 'Updating preview...' : 'Rendering canvas preview...'}
        </p>
      )}
      {error && (
        <p className="mb-3 font-mono text-[10px] text-danger">{error}</p>
      )}
      {!rendering && !error && pageImages.length === 0 && (
        <p className="mb-3 font-mono text-[10px] text-text-dim">No preview pages were generated.</p>
      )}

      <div className="space-y-4">
        {pageImages.map((src, index) => (
          <div key={`${index}-${src.length}`} className="mx-auto w-fit border border-border-dashed bg-white shadow-sm">
            <img
              src={src}
              alt={`Resume page ${index + 1}`}
              className="block h-auto max-w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
