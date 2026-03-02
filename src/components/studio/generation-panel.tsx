import { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  Sparkles,
  Loader2,
  FileText,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Wrench,
  Check,
} from 'lucide-react';
import { profilesAtom } from '../../store/profiles';
import { scenariosAtom } from '../../store/scenarios';
import { resumesAtom, activeResumeAtom } from '../../store/resumes';
import { llmSettingsAtom } from '../../store/settings';
import { generatingAtom } from '../../store/ui';
import { generateResume } from '../../lib/resume-agent';
import { generateId } from '../../lib/utils';
import { Button } from '../ui/button';
import type { AgentStep } from '../../types';

interface Props {
  profileId: string;
  scenarioId: string;
  templateId: string;
}

function stepIcon(kind: string) {
  const cls = 'h-2.5 w-2.5 text-text-muted';
  switch (kind) {
    case 'write_summary':
      return <FileText className={cls} />;
    case 'write_work_experience':
      return <Briefcase className={cls} />;
    case 'write_education':
      return <GraduationCap className={cls} />;
    case 'write_project':
      return <FolderOpen className={cls} />;
    case 'set_skills':
      return <Wrench className={cls} />;
    case 'finalize_resume':
      return <Check className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
}
export function GenerationPanel({ profileId, scenarioId, templateId }: Props) {
  const profiles = useAtomValue(profilesAtom);
  const scenarios = useAtomValue(scenariosAtom);
  const settings = useAtomValue(llmSettingsAtom);
  const [generating, setGenerating] = useAtom(generatingAtom);
  const setResumes = useSetAtom(resumesAtom);
  const setActiveResume = useSetAtom(activeResumeAtom);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const profile = profiles.find((p) => p.id === profileId);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  async function generate() {
    if (!profile || !scenario || !settings.apiKey) return;
    setGenerating(true);
    setError(null);
    setSteps([]);

    try {
      const content = await generateResume({
        profile,
        scenario,
        settings,
        onStep(step) {
          setSteps((prev) => [...prev, step]);
        },
      });

      const resume = {
        id: generateId(),
        profileId,
        scenarioId,
        templateId,
        content,
        createdAt: Date.now(),
      };

      setResumes((prev) => [...prev, resume]);
      setActiveResume(resume);
      setSteps([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }
  const canGenerate = profile && scenario && settings.apiKey && !generating;

  return (
    <div className="space-y-3">
      <Button onClick={generate} disabled={!canGenerate} className="w-full">
        {generating ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" />
            Generate Resume
          </>
        )}
      </Button>

      {!settings.apiKey && (
        <p className="font-mono text-[10px] text-warn">Configure API key in Settings first.</p>
      )}

      {error && <p className="font-mono text-[10px] text-danger">{error}</p>}

      {generating && steps.length > 0 && (
        <div className="rounded border border-dashed border-border-dashed bg-canvas p-2.5">
          <p className="annotation mb-1.5">building resume...</p>
          <ul className="space-y-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-1.5 font-mono text-[10px] text-text-dim">
                {stepIcon(step.kind)}
                <span>{step.label}</span>
                {step.detail && <span className="text-text-muted">-- {step.detail}</span>}
              </li>
            ))}
            <li className="flex items-center gap-1.5 font-mono text-[10px] text-text-dim">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              <span>Thinking...</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
