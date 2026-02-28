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

      // Parse the JSON from the response
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
    <div className="space-y-4">
      <Button onClick={generate} disabled={!canGenerate} className="w-full">
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Resume
          </>
        )}
      </Button>

      {!settings.apiKey && (
        <p className="text-xs text-amber-600">Configure your API key in Settings first.</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {generating && streamedText && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="mb-1 text-xs font-medium text-zinc-500">Streaming response...</p>
          <pre className="max-h-48 overflow-auto text-xs text-zinc-700 whitespace-pre-wrap">{streamedText.slice(-500)}</pre>
        </div>
      )}
    </div>
  );
}
