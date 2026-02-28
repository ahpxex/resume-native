import { useParams, useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { ArrowLeft } from 'lucide-react';
import { scenariosAtom } from '../store/scenarios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { ScenarioForm } from '../components/scenario/scenario-form';
import type { Scenario } from '../types';

export function ScenarioEditor() {
  const { id: profileId, scenarioId } = useParams<{ id: string; scenarioId: string }>();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useAtom(scenariosAtom);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500">Scenario not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(`/profiles/${profileId}/scenarios`)}>
          Back to Scenarios
        </Button>
      </div>
    );
  }

  function updateScenario(updated: Scenario) {
    setScenarios((prev) => prev.map((s) => (s.id === scenarioId ? updated : s)));
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profileId}/scenarios`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Scenarios
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-zinc-900">Edit Scenario</h1>
          <p className="text-sm text-zinc-500">
            Define the target role and job context for tailored resume generation.
          </p>
        </CardHeader>
        <CardContent>
          <ScenarioForm value={scenario} onChange={updateScenario} />
        </CardContent>
      </Card>
    </div>
  );
}
