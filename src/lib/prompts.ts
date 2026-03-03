import type { Profile, Scenario } from '../types';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export function buildAgentSystemPrompt(): string {
  return `You are an expert resume writer. You will be given a candidate's profile and a target job scenario. Your job is to craft a tailored, compelling resume by calling the provided tools section by section.

Follow this order:
1. Call write_summary to create a professional summary tailored to the target role.
2. Call write_work_experience once for each relevant work experience entry, starting with the most recent. Rewrite bullets to emphasize relevant skills and achievements. Use strong action verbs and quantify results.
3. Call write_education once for each education entry.
4. Call write_project for each relevant project. Only include projects that strengthen the application.
5. Call set_skills with skills ordered by relevance to the target role.
6. Call finalize_resume to signal completion.

Guidelines:
- Tailor every section to the target role and job description.
- Keep content concise and suitable for a single-page resume.
- Generate 3-5 bullets per work experience entry.
- Omit irrelevant projects or experiences if they don't strengthen the application.
- Order skills by relevance to the target role.`;
}

export function buildAgentUserPrompt(profile: Profile, scenario: Scenario): string {
  const workExperience = asArray<Profile['workExperience'][number]>(profile.workExperience);
  const education = asArray<Profile['education'][number]>(profile.education);
  const projects = asArray<Profile['projects'][number]>(profile.projects);
  const skills = asArray<string>(profile.skills);

  return `## Candidate Profile
Name: ${profile.personalInfo.fullName}
${profile.personalInfo.location ? `Location: ${profile.personalInfo.location}` : ''}

### Work Experience
${workExperience.map((w) => `- ${w.position} at ${w.company} (${w.startDate}${w.endDate ? ` to ${w.endDate}` : ' to Present'})${w.location ? `, ${w.location}` : ''}
  ${w.description}`).join('\n')}

### Education
${education.map((e) => `- ${e.degree} in ${e.field} at ${e.institution} (${e.startDate}${e.endDate ? ` to ${e.endDate}` : ' to Present'})
  ${e.description}`).join('\n')}

### Projects
${projects.map((p) => {
  const technologies = asArray<string>(p.technologies).join(', ');
  return `- ${p.name}: ${p.description} (Technologies: ${technologies})${p.url ? ` URL: ${p.url}` : ''}`;
}).join('\n')}

### Skills
${skills.join(', ')}

## Target Scenario
Role: ${scenario.targetRole}
${scenario.targetCompany ? `Company: ${scenario.targetCompany}` : ''}
${scenario.jobDescription ? `\nJob Description:\n${scenario.jobDescription}` : ''}
${scenario.customInstructions ? `\nCustom Instructions:\n${scenario.customInstructions}` : ''}

Analyze the candidate's profile against the target role and use the tools to build a tailored resume.`;
}

export const PARSE_EXPERIENCE_SYSTEM = `You are an expert resume parser. The user will provide free-text describing their work experience, education, or projects. Parse it into structured data.

For work experience, extract: company, position, location, startDate (YYYY-MM format), endDate (YYYY-MM format or leave empty if current), and a cleaned-up description.

For education, extract: institution, degree, field, startDate (YYYY-MM), endDate (YYYY-MM), and description.

For projects, extract: name, description, technologies (array of strings), and url if mentioned.

Be thorough and preserve all important details from the original text. If dates are ambiguous, make reasonable estimates. Return valid JSON matching the requested schema.`;

export function buildResumeGenerationPrompt(profile: Profile, scenario: Scenario): string {
  const workExperience = asArray<Profile['workExperience'][number]>(profile.workExperience);
  const education = asArray<Profile['education'][number]>(profile.education);
  const projects = asArray<Profile['projects'][number]>(profile.projects);
  const skills = asArray<string>(profile.skills);

  return `You are an expert resume writer. Generate tailored resume content based on the following context.

## Candidate Profile
Name: ${profile.personalInfo.fullName}
${profile.personalInfo.location ? `Location: ${profile.personalInfo.location}` : ''}

### Work Experience
${workExperience.map((w) => `- ${w.position} at ${w.company} (${w.startDate}${w.endDate ? ` to ${w.endDate}` : ' to Present'})${w.location ? `, ${w.location}` : ''}
  ${w.description}`).join('\n')}

### Education
${education.map((e) => `- ${e.degree} in ${e.field} at ${e.institution} (${e.startDate}${e.endDate ? ` to ${e.endDate}` : ' to Present'})
  ${e.description}`).join('\n')}

### Projects
${projects.map((p) => {
  const technologies = asArray<string>(p.technologies).join(', ');
  return `- ${p.name}: ${p.description} (Technologies: ${technologies})${p.url ? ` URL: ${p.url}` : ''}`;
}).join('\n')}

### Skills
${skills.join(', ')}

## Target Scenario
Role: ${scenario.targetRole}
${scenario.targetCompany ? `Company: ${scenario.targetCompany}` : ''}
${scenario.jobDescription ? `\nJob Description:\n${scenario.jobDescription}` : ''}
${scenario.customInstructions ? `\nCustom Instructions:\n${scenario.customInstructions}` : ''}

## Instructions
1. Write a concise professional summary (2-3 sentences) tailored to the target role.
2. Rewrite work experience bullets to emphasize skills and achievements relevant to the target role. Use strong action verbs and quantify results where possible. Generate 3-5 bullets per role.
3. Include relevant education details.
4. Select and highlight the most relevant projects.
5. Order skills by relevance to the target role.
6. Keep everything concise and suitable for a single-page resume.

Return valid JSON matching this exact structure:
{
  "summary": "string",
  "workExperience": [{"company": "string", "position": "string", "location": "string or omit", "startDate": "YYYY-MM", "endDate": "YYYY-MM or omit if current", "bullets": ["string"]}],
  "education": [{"institution": "string", "degree": "string", "field": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or omit", "details": ["string"] or omit}],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"], "url": "string or omit"}],
  "skills": ["string"]
}`;
}
