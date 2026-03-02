import { useAtomValue } from 'jotai';
import { activeResumeAtom } from '../../store/resumes';
import { profilesAtom } from '../../store/profiles';
import { templateRegistry } from '../../templates/registry';
import { PDFViewer } from '@react-pdf/renderer';

export function ResumePreview() {
  const activeResume = useAtomValue(activeResumeAtom);
  const profiles = useAtomValue(profilesAtom);

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

  const profile = profiles.find((p) => p.id === activeResume.profileId);
  if (!profile) return null;

  const template = templateRegistry[activeResume.templateId];
  if (!template) return null;

  const TemplateComponent = template.component;

  return (
    <PDFViewer
      className="h-full w-full rounded border border-border"
      showToolbar={false}
    >
      <TemplateComponent
        personalInfo={profile.personalInfo}
        content={activeResume.content}
      />
    </PDFViewer>
  );
}
