import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { activeResumeAtom } from '../store/resumes';
import { Button } from '../components/ui/button';
import { TemplatePicker } from '../components/studio/template-picker';
import { GenerationPanel } from '../components/studio/generation-panel';
import { ResumePreview } from '../components/studio/resume-preview';
import { templateRegistry } from '../templates/registry';

export function Studio() {
  const profiles = useAtomValue(profilesAtom);
  const scenarios = useAtomValue(scenariosAtom);
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
    const TemplateComponent = template.component;
    const blob = await pdf(
      <TemplateComponent personalInfo={profile.personalInfo} content={activeResume.content} />
    ).toBlob();
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
        <div className="space-y-1.5">
          <label className="annotation block">Profile</label>
          <select
            className="block w-full rounded border border-border bg-canvas px-3 py-2 font-mono text-xs text-text focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
            value={selectedProfileId}
            onChange={(e) => {
              setSelectedProfileId(e.target.value);
              setSelectedScenarioId('');
            }}
          >
            <option value="">Select a profile...</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scenario selector */}
        {selectedProfileId && (
          <div className="space-y-1.5">
            <label className="annotation block">Scenario</label>
            <select
              className="block w-full rounded border border-border bg-canvas px-3 py-2 font-mono text-xs text-text focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
            >
              <option value="">Select a scenario...</option>
              {filteredScenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {filteredScenarios.length === 0 && (
              <p className="font-mono text-[10px] text-warn">No scenarios for this profile.</p>
            )}
          </div>
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

      {/* Right panel -- preview */}
      <div className="flex-1 bg-canvas p-4">
        <ResumePreview />
      </div>
    </div>
  );
}
