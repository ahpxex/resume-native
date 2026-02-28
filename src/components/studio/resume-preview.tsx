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
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50">
        <p className="text-sm text-zinc-400">Generate a resume to see the preview.</p>
      </div>
    );
  }

  const profile = profiles.find((p) => p.id === activeResume.profileId);
  if (!profile) return null;

  const template = templateRegistry[activeResume.templateId];
  if (!template) return null;

  const TemplateComponent = template.component;

  return (
    <PDFViewer className="h-full w-full rounded-lg border border-zinc-200" showToolbar={false}>
      <TemplateComponent personalInfo={profile.personalInfo} content={activeResume.content} />
    </PDFViewer>
  );
}
