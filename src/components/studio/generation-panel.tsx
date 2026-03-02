import { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Sparkles, Loader2 } from 'lucide-react';
import { streamText } from 'ai';
import { profilesAtom } from '../../store/profiles';
import { scenariosAtom } from '../../store/scenarios';
import { resumesAtom, activeResumeAtom } from '../../store/resumes';
import { llmSettingsAtom } from '../../store/settings';
import { generatingAtom } from '../../store/ui';
import { getModel } from '../../lib/ai';
import { buildResumeGenerationPrompt } from '../../lib/prompts';
import { generateId } from '../../lib/utils';
import { Button } from '../ui/button';
import type { ResumeContent } from '../../types';

interface Props {
  profileId: string;
  scenarioId: string;
  templateId: string;
}

export function GenerationPanel({ profileId, scenarioId, templateId }: Props) {
  const profiles = useAtomValue(profilesAtom);
  const scenarios = useAtomValue(scenariosAtom);
  const settings = useAtomValue(llmSettingsAtom);
  const [generating, setGenerating] = useAtom(generatingAtom);
  const setResumes = useSetAtom(resumesAtom);
  const setActiveResume = useSetAtom(activeResumeAtom);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const profile = profiles.find((p) => p.id === profileId);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  async function generate() {
    if (!profile || !scenario || !settings.apiKey) return;
    setGenerating(true);
    setError(null);
    setStreamedText('');

    try {
      const model = getModel(settings);
      const prompt = buildResumeGenerationPrompt(profile, scenario);

      const result = streamText({
        model,
        prompt,
      });

      let fullText = '';
      for await (const chunk of result.textStream) {
        fullText += chunk;
        setStreamedText(fullText);
      }

      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in response');

      const content: ResumeContent = JSON.parse(jsonMatch[0]);

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
      setStreamedText('');
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

      {generating && streamedText && (
        <div className="rounded border border-dashed border-border-dashed bg-canvas p-2.5">
          <p className="annotation mb-1.5">streaming...</p>
          <pre className="max-h-36 overflow-auto font-mono text-[10px] leading-relaxed text-text-dim whitespace-pre-wrap">
            {streamedText.slice(-400)}
          </pre>
        </div>
      )}
    </div>
  );
}
