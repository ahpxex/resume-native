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
    a.download = `resume-${profile.personalInfo.fullName || 'untitled'}.pdf`.replace(/\s+/g, '-').toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  }

  // When template changes and there's an active resume, update it
  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    if (activeResume) {
      setActiveResume({ ...activeResume, templateId });
    }
  }

  return (
    <div className="flex h-full">
      {/* Left panel - controls */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-4 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Resume Studio</h1>
          <p className="text-sm text-zinc-500">Generate and preview resumes.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Profile</label>
          <select
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={selectedProfileId}
            onChange={(e) => {
              setSelectedProfileId(e.target.value);
              setSelectedScenarioId('');
            }}
          >
            <option value="">Select a profile...</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProfileId && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Scenario</label>
            <select
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
            >
              <option value="">Select a scenario...</option>
              {filteredScenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {filteredScenarios.length === 0 && (
              <p className="text-xs text-amber-600">No scenarios for this profile. Create one first.</p>
            )}
          </div>
        )}

        <TemplatePicker value={selectedTemplateId} onChange={handleTemplateChange} />

        {selectedProfileId && selectedScenarioId && (
          <GenerationPanel
            profileId={selectedProfileId}
            scenarioId={selectedScenarioId}
            templateId={selectedTemplateId}
          />
        )}

        {activeResume && (
          <Button variant="secondary" className="w-full" onClick={exportPdf}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        )}
      </div>

      {/* Right panel - preview */}
      <div className="flex-1 bg-zinc-100 p-4">
        <ResumePreview />
      </div>
    </div>
  );
}
