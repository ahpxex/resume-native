import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from './ai';
import { buildResumeGenerationPrompt } from './prompts';
import type {
  Profile,
  Scenario,
  LLMSettings,
  ResumeContent,
  AgentStep,
} from '../types';

interface GenerateResumeOptions {
  profile: Profile;
  scenario: Scenario;
  settings: LLMSettings;
  onStep?: (step: AgentStep) => void;
}

const resumeSchema = z.object({
  summary: z.string(),
  workExperience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      details: z.array(z.string()).optional(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string().optional(),
    }),
  ),
  skills: z.array(z.string()),
});

export async function generateResume({
  profile,
  scenario,
  settings,
  onStep,
}: GenerateResumeOptions): Promise<ResumeContent> {
  onStep?.({ kind: 'analyze_profile', label: 'Analyzing profile and scenario', timestamp: Date.now() });
  const model = getModel(settings);
  onStep?.({ kind: 'generate_json', label: 'Generating structured resume JSON', timestamp: Date.now() });
  const { object } = await generateObject({
    model,
    prompt: buildResumeGenerationPrompt(profile, scenario),
    schema: resumeSchema,
  });

  const content: ResumeContent = {
    summary: object.summary,
    workExperience: object.workExperience,
    education: object.education,
    projects: object.projects,
    skills: object.skills,
  };

  onStep?.({ kind: 'finalize_resume', label: 'Finalizing resume', timestamp: Date.now() });

  if (
    !content.summary.trim() &&
    content.workExperience.length === 0 &&
    content.education.length === 0 &&
    content.projects.length === 0 &&
    content.skills.length === 0
  ) {
    throw new Error('Resume generation failed: no content was produced.');
  }

  return content;
}
