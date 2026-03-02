import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { llmSettingsAtom } from '../../store/settings';
import { getModel } from '../../lib/ai';
import { PARSE_EXPERIENCE_SYSTEM } from '../../lib/prompts';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import type { WorkExperience, Education, Project } from '../../types';
import { generateId } from '../../lib/utils';

type ParseType = 'work' | 'education' | 'project';

interface Props {
  onAddExperience: (items: WorkExperience[]) => void;
  onAddEducation: (items: Education[]) => void;
  onAddProject: (items: Project[]) => void;
}

const workSchema = z.object({
  items: z.array(z.object({
    company: z.string(),
    position: z.string(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
  })),
});

const educationSchema = z.object({
  items: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
  })),
});

const projectSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    url: z.string().optional(),
  })),
});

export function AiParser({ onAddExperience, onAddEducation, onAddProject }: Props) {
  const settings = useAtomValue(llmSettingsAtom);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parseType, setParseType] = useState<ParseType>('work');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function parse() {
    if (!text.trim() || !settings.apiKey) return;
    setParsing(true);
    setError(null);
    try {
      const model = getModel(settings);
      if (parseType === 'work') {
        const { object } = await generateObject({ model, system: PARSE_EXPERIENCE_SYSTEM, prompt: `Parse the following as work experience:\n\n${text}`, schema: workSchema });
        onAddExperience(object.items.map((item) => ({ ...item, id: generateId() })));
      } else if (parseType === 'education') {
        const { object } = await generateObject({ model, system: PARSE_EXPERIENCE_SYSTEM, prompt: `Parse the following as education:\n\n${text}`, schema: educationSchema });
        onAddEducation(object.items.map((item) => ({ ...item, id: generateId() })));
      } else {
        const { object } = await generateObject({ model, system: PARSE_EXPERIENCE_SYSTEM, prompt: `Parse the following as project(s):\n\n${text}`, schema: projectSchema });
        onAddProject(object.items.map((item) => ({ ...item, id: generateId() })));
      }
      setText('');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse text');
    } finally {
      setParsing(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} disabled={!settings.apiKey}>
        <Sparkles className="h-4 w-4" />
        AI Parse
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="AI-Assisted Parser">
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-text-muted tracking-wide">
            Paste free-text describing your experience and AI will parse it into structured entries.
          </p>
          <div className="flex gap-2">
            {(['work', 'education', 'project'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setParseType(type)}
                className={`rounded px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  parseType === type
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-text-muted hover:bg-surface-raised border border-transparent'
                }`}
              >
                {type === 'work' ? 'Work Experience' : type === 'education' ? 'Education' : 'Project'}
              </button>
            ))}
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I worked at Google for 3 years as a senior frontend engineer building Search UI with React and TypeScript. Before that, I was at Meta for 2 years working on the News Feed team..."
            rows={8}
          />
          {error && <p className="text-[10px] font-mono text-danger tracking-wide">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={parse} disabled={parsing || !text.trim()}>
              {parsing ? (
                <span className="text-text-muted">Parsing...</span>
              ) : (
                'Parse with AI'
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
