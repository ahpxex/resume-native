export interface Profile {
  id: string;
  name: string;
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Scenario {
  id: string;
  profileId: string;
  name: string;
  targetRole: string;
  targetCompany?: string;
  jobDescription?: string;
  customInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GeneratedResume {
  id: string;
  profileId: string;
  scenarioId: string;
  templateId: string;
  content: ResumeContent;
  createdAt: number;
}

export interface ResumeContent {
  summary: string;
  workExperience: ResumeWorkExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: string[];
}

export interface ResumeWorkExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  details?: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface LLMSettings {
  provider: 'openai-compatible';
  apiKey: string;
  baseUrl: string;
  model: string;
}
