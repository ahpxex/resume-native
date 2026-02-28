import type { Profile, Scenario } from '../types';

export const PARSE_EXPERIENCE_SYSTEM = `You are an expert resume parser. The user will provide free-text describing their work experience, education, or projects. Parse it into structured data.

For work experience, extract: company, position, location, startDate (YYYY-MM format), endDate (YYYY-MM format or leave empty if current), and a cleaned-up description.

For education, extract: institution, degree, field, startDate (YYYY-MM), endDate (YYYY-MM), and description.

For projects, extract: name, description, technologies (array of strings), and url if mentioned.

Be thorough and preserve all important details from the original text. If dates are ambiguous, make reasonable estimates. Return valid JSON matching the requested schema.`;

export function buildResumeGenerationPrompt(profile: Profile, scenario: Scenario): string {
  return `You are an expert resume writer. Generate tailored resume content based on the following context.

## Candidate Profile
Name: ${profile.personalInfo.fullName}
${profile.personalInfo.location ? `Location: ${profile.personalInfo.location}` : ''}

### Work Experience
${profile.workExperience.map((w) => `- ${w.position} at ${w.company} (${w.startDate}${w.endDate ? ` to ${w.endDate}` : ' to Present'})${w.location ? `, ${w.location}` : ''}
  ${w.description}`).join('\n')}

### Education
${profile.education.map((e) => `- ${e.degree} in ${e.field} at ${e.institution} (${e.startDate}${e.endDate ? ` to ${e.endDate}` : ' to Present'})
  ${e.description}`).join('\n')}

### Projects
${profile.projects.map((p) => `- ${p.name}: ${p.description} (Technologies: ${p.technologies.join(', ')})${p.url ? ` URL: ${p.url}` : ''}`).join('\n')}

### Skills
${profile.skills.join(', ')}

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
