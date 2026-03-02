import { generateText, tool, stepCountIs, hasToolCall } from 'ai';
import { z } from 'zod';
import { getModel } from './ai';
import { buildAgentSystemPrompt, buildAgentUserPrompt } from './prompts';
import type {
  Profile,
  Scenario,
  LLMSettings,
  ResumeContent,
  ResumeWorkExperience,
  ResumeEducation,
  ResumeProject,
  AgentStep,
} from '../types';

interface ResumeAccumulator {
  summary: string | null;
  workExperience: ResumeWorkExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: string[] | null;
  finalized: boolean;
}

interface GenerateResumeOptions {
  profile: Profile;
  scenario: Scenario;
  settings: LLMSettings;
  onStep?: (step: AgentStep) => void;
}

export async function generateResume({
  profile,
  scenario,
  settings,
  onStep,
}: GenerateResumeOptions): Promise<ResumeContent> {
  const acc: ResumeAccumulator = {
    summary: null,
    workExperience: [],
    education: [],
    projects: [],
    skills: null,
    finalized: false,
  };

  const model = getModel(settings);
  const resumeTools = {
    write_summary: tool({
      description: 'Write the professional summary section of the resume.',
      inputSchema: z.object({
        summary: z.string().describe('A concise 2-3 sentence professional summary tailored to the target role.'),
      }),
      execute: async ({ summary }) => {
        acc.summary = summary;
        return 'Summary saved.';
      },
    }),
    write_work_experience: tool({
      description: 'Add a work experience entry. Call once per role, most recent first.',
      inputSchema: z.object({
        company: z.string(),
        position: z.string(),
        location: z.string().optional(),
        startDate: z.string().describe('YYYY-MM format'),
        endDate: z.string().optional().describe('YYYY-MM format, omit if current'),
        bullets: z.array(z.string()).describe('3-5 achievement-oriented bullet points'),
      }),
      execute: async (entry) => {
        acc.workExperience.push(entry);
        return `Work experience added: ${entry.position} at ${entry.company}.`;
      },
    }),
    write_education: tool({
      description: 'Add an education entry to the resume.',
      inputSchema: z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string().describe('YYYY-MM format'),
        endDate: z.string().optional().describe('YYYY-MM format, omit if current'),
        details: z.array(z.string()).optional().describe('Notable achievements or relevant coursework'),
      }),
      execute: async (entry) => {
        acc.education.push(entry);
        return `Education added: ${entry.degree} at ${entry.institution}.`;
      },
    }),
    write_project: tool({
      description: 'Add a project entry. Only include relevant projects.',
      inputSchema: z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        url: z.string().optional(),
      }),
      execute: async (entry) => {
        acc.projects.push(entry);
        return `Project added: ${entry.name}.`;
      },
    }),
    set_skills: tool({
      description: 'Set the skills list, ordered by relevance to the target role.',
      inputSchema: z.object({
        skills: z.array(z.string()),
      }),
      execute: async ({ skills }) => {
        acc.skills = skills;
        return `Skills set (${skills.length} items).`;
      },
    }),
    finalize_resume: tool({
      description: 'Signal that the resume is complete. Call after all sections are written.',
      inputSchema: z.object({}),
      execute: async () => {
        acc.finalized = true;
        return 'Resume finalized.';
      },
    }),
  };

  await generateText({
    model,
    tools: resumeTools,
    system: buildAgentSystemPrompt(),
    prompt: buildAgentUserPrompt(profile, scenario),
    stopWhen: [hasToolCall('finalize_resume'), stepCountIs(10)],
    onStepFinish({ toolCalls }) {
      if (!onStep) return;
      for (const tc of toolCalls) {
        const step = toAgentStep(tc.toolName, tc.input as Record<string, unknown>);
        if (step) onStep(step);
      }
    },
  });

  if (!acc.summary && acc.workExperience.length === 0) {
    throw new Error('Resume generation failed: no content was produced.');
  }

  return {
    summary: acc.summary ?? '',
    workExperience: acc.workExperience,
    education: acc.education,
    projects: acc.projects,
    skills: acc.skills ?? [],
  };
}

function toAgentStep(name: string, args: Record<string, unknown>): AgentStep | null {
  const timestamp = Date.now();
  switch (name) {
    case 'write_summary':
      return { kind: name, label: 'Writing professional summary', timestamp };
    case 'write_work_experience':
      return { kind: name, label: 'Writing work experience', detail: `${args.position} at ${args.company}`, timestamp };
    case 'write_education':
      return { kind: name, label: 'Writing education', detail: `${args.degree} at ${args.institution}`, timestamp };
    case 'write_project':
      return { kind: name, label: 'Writing project', detail: args.name as string, timestamp };
    case 'set_skills':
      return { kind: name, label: 'Setting skills', timestamp };
    case 'finalize_resume':
      return { kind: name, label: 'Finalizing resume', timestamp };
    default:
      return null;
  }
}
