import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { Download, Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { activeResumeAtom, resumesAtom } from '../store/resumes';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { TemplatePicker } from '../components/studio/template-picker';
import { GenerationPanel } from '../components/studio/generation-panel';
import { ResumePreview } from '../components/studio/resume-preview';
import { templateRegistry } from '../templates/registry';
import { buildResumePdfBlob } from '../lib/resume-pdf';
import { generateId } from '../lib/utils';
import type { Profile, ResumeContent, Scenario } from '../types';

export function Studio() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const [scenarios, setScenarios] = useAtom(scenariosAtom);
  const [, setResumes] = useAtom(resumesAtom);
  const [activeResume, setActiveResume] = useAtom(activeResumeAtom);

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic');

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0] ?? null;
  const effectiveProfileId = selectedProfile?.id ?? '';
  const profileScenarios = scenarios.filter((scenario) => scenario.profileId === effectiveProfileId);
  const selectedScenario = profileScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? profileScenarios[0] ?? null;
  const effectiveScenarioId = selectedScenario?.id ?? '';

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

  function createProfile() {
    const now = Date.now();
    const profile: Profile = {
      id: generateId(),
      name: 'New Profile',
      personalInfo: { fullName: '', email: '' },
      workExperience: [],
      education: [],
      projects: [],
      skills: [],
      createdAt: now,
      updatedAt: now,
    };

    setProfiles((current) => [...current, profile]);
    setSelectedProfileId(profile.id);
    setSelectedScenarioId('');
    setActiveResume(null);
  }

  function createScenario() {
    if (!effectiveProfileId) return;

    const now = Date.now();
    const scenario: Scenario = {
      id: generateId(),
      profileId: effectiveProfileId,
      name: 'New Scenario',
      targetRole: '',
      createdAt: now,
      updatedAt: now,
    };

    setScenarios((current) => [...current, scenario]);
    setSelectedScenarioId(scenario.id);
    setActiveResume(null);
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
      <div className="w-64 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 space-y-5">
        <div>
          <span className="annotation">resume studio</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent/60" />
            <span className="font-mono text-[10px] text-text-dim">generate & preview</span>
          </div>
        </div>

        <div className="border-t border-dashed border-border-dashed" />

        <Select
          label="Profile"
          placeholder="Create your first profile"
          options={profiles.map((profile) => ({ value: profile.id, label: profile.name }))}
          value={effectiveProfileId}
          onChange={(value) => {
            const nextScenario = scenarios.find((scenario) => scenario.profileId === value);
            setSelectedProfileId(value);
            setSelectedScenarioId(nextScenario?.id ?? '');
            setActiveResume(null);
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={createProfile}>
            <Plus className="h-3 w-3" />
            Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!effectiveProfileId}
            onClick={() => navigate(`/profiles/${effectiveProfileId}`)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>

        {effectiveProfileId && (
          <>
            <Select
              label="Scenario"
              placeholder="Create a scenario"
              options={profileScenarios.map((scenario) => ({ value: scenario.id, label: scenario.name }))}
              value={effectiveScenarioId}
              onChange={(value) => {
                setSelectedScenarioId(value);
                setActiveResume(null);
              }}
            />

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={createScenario}>
                <Plus className="h-3 w-3" />
                Scenario
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!effectiveScenarioId}
                onClick={() => navigate(`/profiles/${effectiveProfileId}/scenarios/${effectiveScenarioId}`)}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>

            {profileScenarios.length === 0 && (
              <p className="font-mono text-[10px] text-warn">This profile has no scenarios yet.</p>
            )}
          </>
        )}

        <div className="border-t border-dashed border-border-dashed" />

        <TemplatePicker value={selectedTemplateId} onChange={handleTemplateChange} />

        {effectiveProfileId && effectiveScenarioId && (
          <>
            <div className="border-t border-dashed border-border-dashed" />
            <GenerationPanel
              profileId={effectiveProfileId}
              scenarioId={effectiveScenarioId}
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
      <div className="flex-1 min-w-0 bg-canvas p-4">
        <div className="h-full min-w-0">
          <ResumePreview onContentChange={handleResumeContentChange} />
        </div>
      </div>
    </div>
  );
}
