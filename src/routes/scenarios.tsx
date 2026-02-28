import { useParams, useNavigate } from 'react-router';
import { useAtom, useAtomValue } from 'jotai';
import { Plus, ArrowLeft, ChevronRight, Trash2 } from 'lucide-react';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { generateId } from '../lib/utils';
import type { Scenario } from '../types';

export function Scenarios() {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profiles = useAtomValue(profilesAtom);
  const [scenarios, setScenarios] = useAtom(scenariosAtom);

  const profile = profiles.find((p) => p.id === profileId);
  const profileScenarios = scenarios.filter((s) => s.profileId === profileId);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500">Profile not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          Back to Dashboard
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
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profileId}`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Scenarios</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Scenarios for <span className="font-medium">{profile.name}</span>
          </p>
        </div>
        <Button onClick={createScenario}>
          <Plus className="h-4 w-4" />
          New Scenario
        </Button>
      </div>

      {profileScenarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-500">No scenarios yet. Create one to start tailoring resumes.</p>
            <Button className="mt-4" onClick={createScenario}>
              <Plus className="h-4 w-4" />
              Create Scenario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profileScenarios.map((scenario) => (
            <Card key={scenario.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-zinc-900 truncate">{scenario.name}</h3>
                  <p className="text-sm text-zinc-500 truncate">
                    {scenario.targetRole}
                    {scenario.targetCompany && ` at ${scenario.targetCompany}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => deleteScenario(scenario.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profileId}/scenarios/${scenario.id}`)}>
                    Edit
                    <ChevronRight className="h-4 w-4" />
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
