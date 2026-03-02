import { useCallback, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Download } from 'lucide-react';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { activeResumeAtom, resumesAtom } from '../store/resumes';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { TemplatePicker } from '../components/studio/template-picker';
import { GenerationPanel } from '../components/studio/generation-panel';
import { ResumePreview } from '../components/studio/resume-preview';
import { ResumeEditorPanel } from '../components/studio/resume-editor-panel';
import { templateRegistry } from '../templates/registry';
import { buildResumePdfBlob } from '../lib/resume-pdf';
import type { ResumeContent } from '../types';

export function Studio() {
  const profiles = useAtomValue(profilesAtom);
  const scenarios = useAtomValue(scenariosAtom);
  const [, setResumes] = useAtom(resumesAtom);
  const [activeResume, setActiveResume] = useAtom(activeResumeAtom);

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic');

  const filteredScenarios = scenarios.filter((s) => s.profileId === selectedProfileId);

  async function exportPdf() {
    if (!activeResume) return;
    const profile = profiles.find((p) => p.id === activeResume.profileId);
    if (!profile) return;
    const template = templateRegistry[activeResume.templateId];
    if (!template) return;
    const blob = await buildResumePdfBlob({
      template: template.component,
      personalInfo: profile.personalInfo,
      content: activeResume.content,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${profile.personalInfo.fullName || 'untitled'}.pdf`
      .replace(/\s+/g, '-')
      .toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    if (activeResume) {
      setActiveResume({ ...activeResume, templateId });
    }
  }

  const handleResumeContentChange = useCallback((resumeId: string, content: ResumeContent) => {
    setActiveResume((current) => {
      if (!current || current.id !== resumeId) return current;
      if (current.content === content) return current;
      return { ...current, content };
    });

    setResumes((current) =>
      current.map((resume) =>
        resume.id === resumeId
          ? (resume.content === content ? resume : { ...resume, content })
          : resume
      )
    );
  }, [setActiveResume, setResumes]);

  return (
    <div className="flex h-full">
      {/* Left panel -- controls */}
      <div className="w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 space-y-5">
        <div>
          <span className="annotation">resume studio</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent/60" />
            <span className="font-mono text-[10px] text-text-dim">generate & preview</span>
          </div>
        </div>

        <div className="border-t border-dashed border-border-dashed" />

        {/* Profile selector */}
        <Select
          label="Profile"
          placeholder="Select a profile..."
          options={profiles.map((p) => ({ value: p.id, label: p.name }))}
          value={selectedProfileId}
          onChange={(val) => {
            setSelectedProfileId(val);
            setSelectedScenarioId('');
          }}
        />

        {/* Scenario selector */}
        {selectedProfileId && (
          <>
            <Select
              label="Scenario"
              placeholder="Select a scenario..."
              options={filteredScenarios.map((s) => ({ value: s.id, label: s.name }))}
              value={selectedScenarioId}
              onChange={(val) => setSelectedScenarioId(val)}
            />
            {filteredScenarios.length === 0 && (
              <p className="font-mono text-[10px] text-warn">No scenarios for this profile.</p>
            )}
          </>
        )}

        <div className="border-t border-dashed border-border-dashed" />

        <TemplatePicker value={selectedTemplateId} onChange={handleTemplateChange} />

        {selectedProfileId && selectedScenarioId && (
          <>
            <div className="border-t border-dashed border-border-dashed" />
            <GenerationPanel
              profileId={selectedProfileId}
              scenarioId={selectedScenarioId}
              templateId={selectedTemplateId}
            />
          </>
        )}

        {activeResume && (
          <>
            <div className="border-t border-dashed border-border-dashed" />
            <Button variant="secondary" className="w-full" onClick={exportPdf}>
              <Download className="h-3 w-3" />
              Export PDF
            </Button>
          </>
        )}
      </div>

      {/* Right panel -- preview + editor */}
      <div className="flex-1 min-w-0 bg-canvas p-4">
        <div className="flex h-full gap-4">
          <div className="min-w-0 flex-1">
            <ResumePreview />
          </div>
          <div className="w-[26rem] shrink-0">
            <ResumeEditorPanel
              key={activeResume?.id ?? 'no-resume'}
              resume={activeResume}
              onContentChange={handleResumeContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
