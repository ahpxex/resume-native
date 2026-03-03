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
  const scenario = scenarios.find((s) => s.id === scenarioId && s.profileId === profileId);

  if (!scenario) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center">
        <p className="annotation mb-4">scenario not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/profiles/${profileId}/scenarios`)}>
          <ArrowLeft className="h-3 w-3" />
          Back to Scenarios
        </Button>
      </div>
    );
  }

  function updateScenario(updated: Scenario) {
    setScenarios((prev) => prev.map((s) =>
      (s.id === scenarioId && s.profileId === profileId ? updated : s)
    ));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profileId}/scenarios`)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Scenarios
        </Button>
        <div className="mx-1 h-4 w-px bg-border-dashed" />
        <span className="font-mono text-xs text-text-muted truncate">{scenario.name}</span>
      </div>

      <div className="annotation mb-4 pl-1">scenario configuration</div>

      <Card marked>
        <CardHeader>
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
            Target & Context
          </h2>
          <p className="mt-1 font-mono text-[10px] text-text-dim">
            Define the role and job context for tailored resume generation.
          </p>
        </CardHeader>
        <CardContent>
          <ScenarioForm value={scenario} onChange={updateScenario} />
        </CardContent>
      </Card>

      <div className="h-16" />
    </div>
  );
}
