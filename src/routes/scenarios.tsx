import { useParams, useNavigate } from 'react-router';
import { useAtom, useAtomValue } from 'jotai';
import { Plus, ArrowLeft, ChevronRight, Trash2 } from 'lucide-react';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { activeResumeAtom, resumesAtom } from '../store/resumes';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { generateId } from '../lib/utils';
import type { Scenario } from '../types';

export function Scenarios() {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profiles = useAtomValue(profilesAtom);
  const [scenarios, setScenarios] = useAtom(scenariosAtom);
  const [resumes, setResumes] = useAtom(resumesAtom);
  const [activeResume, setActiveResume] = useAtom(activeResumeAtom);

  const profile = profiles.find((p) => p.id === profileId);
  const profileScenarios = scenarios.filter((s) => s.profileId === profileId);

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <p className="annotation mb-4">profile not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-3 w-3" />
          Dashboard
        </Button>
      </div>
    );
  }

  function createScenario() {
    const now = Date.now();
    const scenario: Scenario = {
      id: generateId(),
      profileId: profileId!,
      name: 'New Scenario',
      targetRole: '',
      createdAt: now,
      updatedAt: now,
    };
    setScenarios((prev) => [...prev, scenario]);
    navigate(`/profiles/${profileId}/scenarios/${scenario.id}`);
  }

  function deleteScenario(scenarioId: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    setResumes((prev) => prev.filter((resume) => resume.scenarioId !== scenarioId));
    if (activeResume?.scenarioId === scenarioId) {
      const fallbackResume = resumes.find((resume) =>
        resume.profileId === profileId
        && resume.scenarioId !== scenarioId
      ) ?? null;
      setActiveResume(fallbackResume);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profileId}`)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Profile
        </Button>
        <div className="mx-1 h-4 w-px bg-border-dashed" />
        <span className="font-mono text-xs text-text-muted truncate">{profile.name}</span>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="annotation">scenarios</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-accent/60" />
            <span className="font-mono text-[10px] text-text-dim">
              {profileScenarios.length} registered
            </span>
          </div>
        </div>
        <Button onClick={createScenario}>
          <Plus className="h-3 w-3" />
          New Scenario
        </Button>
      </div>

      <div className="mb-6 border-t border-dashed border-border-dashed" />

      {profileScenarios.length === 0 ? (
        <Card marked>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="annotation mb-2">no scenarios</p>
            <p className="font-mono text-[10px] text-text-dim mb-4">
              Create a scenario to define target roles for resume generation.
            </p>
            <Button onClick={createScenario}>
              <Plus className="h-3 w-3" />
              Create Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {profileScenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardContent className="flex items-center gap-4 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-dashed border-border-dashed">
                  <span className="font-mono text-[10px] text-text-dim">
                    {scenario.name[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text truncate">{scenario.name}</p>
                  <p className="annotation truncate">
                    {scenario.targetRole || 'no role set'}
                    {scenario.targetCompany && ` / ${scenario.targetCompany}`}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" onClick={() => deleteScenario(scenario.id)}>
                    <Trash2 className="h-3 w-3 text-danger" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/profiles/${profileId}/scenarios/${scenario.id}`)}
                  >
                    Edit
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
