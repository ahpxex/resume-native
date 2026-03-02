import { useState } from 'react';
import { PencilLine, Plus, Trash2 } from 'lucide-react';
import type {
  GeneratedResume,
  ResumeContent,
  ResumeEducation,
  ResumeProject,
  ResumeWorkExperience,
} from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

function createEmptyWorkExperience(): ResumeWorkExperience {
  return {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [''],
  };
}

function createEmptyEducation(): ResumeEducation {
  return {
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    details: [''],
  };
}

function createEmptyProject(): ResumeProject {
  return {
    name: '',
    description: '',
    technologies: [],
    url: '',
  };
}

interface Props {
  resume: GeneratedResume | null;
  onContentChange: (resumeId: string, content: ResumeContent) => void;
}

export function ResumeEditorPanel({ resume, onContentChange }: Props) {
  const [draft, setDraft] = useState<ResumeContent | null>(resume?.content ?? null);
  const resumeId = resume?.id ?? null;

  function updateDraft(updater: (content: ResumeContent) => ResumeContent) {
    setDraft((current) => {
      if (!current || !resumeId) return current;
      const next = updater(current);
      onContentChange(resumeId, next);
      return next;
    });
  }

  function updateWorkExperience(index: number, updates: Partial<ResumeWorkExperience>) {
    updateDraft((current) => ({
      ...current,
      workExperience: current.workExperience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  }

  function updateEducation(index: number, updates: Partial<ResumeEducation>) {
    updateDraft((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  }

  function updateProject(index: number, updates: Partial<ResumeProject>) {
    updateDraft((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      ),
    }));
  }

  if (!resume || !draft) {
    return (
      <div className="flex h-full items-center justify-center rounded border border-dashed border-border-dashed bg-surface p-4">
        <div className="text-center">
          <p className="annotation mb-1">editor panel</p>
          <p className="font-mono text-[10px] text-text-dim">
            Generate a resume first, then edit it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto rounded border border-border bg-surface">
      <div className="border-b border-dashed border-border-dashed px-4 py-3">
        <div className="flex items-center gap-1.5">
          <PencilLine className="h-3 w-3 text-accent" />
          <span className="annotation">edit generated resume</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-text-dim">
          Changes autosave and refresh the preview.
        </p>
      </div>

      <div className="space-y-5 p-4">
        <Textarea
          id={`summary-${resume.id}`}
          label="Summary"
          value={draft.summary}
          onChange={(event) => {
            const summary = event.target.value;
            updateDraft((current) => ({ ...current, summary }));
          }}
          rows={5}
          placeholder="Write a concise summary..."
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="annotation">work experience</span>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                updateDraft((current) => ({
                  ...current,
                  workExperience: [...current.workExperience, createEmptyWorkExperience()],
                }));
              }}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {draft.workExperience.length === 0 && (
            <p className="rounded border border-dashed border-border-dashed px-3 py-2 font-mono text-[10px] text-text-dim">
              No work experience yet.
            </p>
          )}

          {draft.workExperience.map((job, jobIndex) => (
            <Card key={`work-${jobIndex}`}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3">
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      <Input
                        id={`work-position-${jobIndex}`}
                        label="Position"
                        value={job.position}
                        onChange={(event) => {
                          updateWorkExperience(jobIndex, { position: event.target.value });
                        }}
                        placeholder="Senior Frontend Engineer"
                      />
                      <Input
                        id={`work-company-${jobIndex}`}
                        label="Company"
                        value={job.company}
                        onChange={(event) => {
                          updateWorkExperience(jobIndex, { company: event.target.value });
                        }}
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                      <Input
                        id={`work-start-date-${jobIndex}`}
                        label="Start Date"
                        value={job.startDate}
                        onChange={(event) => {
                          updateWorkExperience(jobIndex, { startDate: event.target.value });
                        }}
                        placeholder="2022-01"
                      />
                      <Input
                        id={`work-end-date-${jobIndex}`}
                        label="End Date"
                        value={job.endDate || ''}
                        onChange={(event) => {
                          updateWorkExperience(jobIndex, { endDate: event.target.value });
                        }}
                        placeholder="Present"
                      />
                      <Input
                        id={`work-location-${jobIndex}`}
                        label="Location"
                        value={job.location || ''}
                        onChange={(event) => {
                          updateWorkExperience(jobIndex, { location: event.target.value });
                        }}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="mt-5"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        workExperience: current.workExperience.filter((_, index) => index !== jobIndex),
                      }));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>

                <Textarea
                  id={`work-bullets-${jobIndex}`}
                  label="Bullets (one per line)"
                  value={job.bullets.join('\n')}
                  onChange={(event) => {
                    updateWorkExperience(jobIndex, { bullets: event.target.value.split('\n') });
                  }}
                  rows={5}
                  placeholder="Describe impact and outcomes..."
                />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="annotation">education</span>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                updateDraft((current) => ({
                  ...current,
                  education: [...current.education, createEmptyEducation()],
                }));
              }}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {draft.education.length === 0 && (
            <p className="rounded border border-dashed border-border-dashed px-3 py-2 font-mono text-[10px] text-text-dim">
              No education entries yet.
            </p>
          )}

          {draft.education.map((education, educationIndex) => (
            <Card key={`education-${educationIndex}`}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3">
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      <Input
                        id={`education-degree-${educationIndex}`}
                        label="Degree"
                        value={education.degree}
                        onChange={(event) => {
                          updateEducation(educationIndex, { degree: event.target.value });
                        }}
                        placeholder="B.S."
                      />
                      <Input
                        id={`education-field-${educationIndex}`}
                        label="Field"
                        value={education.field}
                        onChange={(event) => {
                          updateEducation(educationIndex, { field: event.target.value });
                        }}
                        placeholder="Computer Science"
                      />
                    </div>

                    <Input
                      id={`education-institution-${educationIndex}`}
                      label="Institution"
                      value={education.institution}
                      onChange={(event) => {
                        updateEducation(educationIndex, { institution: event.target.value });
                      }}
                      placeholder="Stanford University"
                    />

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      <Input
                        id={`education-start-date-${educationIndex}`}
                        label="Start Date"
                        value={education.startDate}
                        onChange={(event) => {
                          updateEducation(educationIndex, { startDate: event.target.value });
                        }}
                        placeholder="2018"
                      />
                      <Input
                        id={`education-end-date-${educationIndex}`}
                        label="End Date"
                        value={education.endDate || ''}
                        onChange={(event) => {
                          updateEducation(educationIndex, { endDate: event.target.value });
                        }}
                        placeholder="2022"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="mt-5"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        education: current.education.filter((_, index) => index !== educationIndex),
                      }));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>

                <Textarea
                  id={`education-details-${educationIndex}`}
                  label="Details (one bullet per line)"
                  value={(education.details || []).join('\n')}
                  onChange={(event) => {
                    updateEducation(educationIndex, { details: event.target.value.split('\n') });
                  }}
                  rows={4}
                  placeholder="Add relevant coursework, honors, or achievements..."
                />
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="annotation">projects</span>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                updateDraft((current) => ({
                  ...current,
                  projects: [...current.projects, createEmptyProject()],
                }));
              }}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {draft.projects.length === 0 && (
            <p className="rounded border border-dashed border-border-dashed px-3 py-2 font-mono text-[10px] text-text-dim">
              No projects yet.
            </p>
          )}

          {draft.projects.map((project, projectIndex) => (
            <Card key={`project-${projectIndex}`}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3">
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      <Input
                        id={`project-name-${projectIndex}`}
                        label="Project Name"
                        value={project.name}
                        onChange={(event) => {
                          updateProject(projectIndex, { name: event.target.value });
                        }}
                        placeholder="Conversion-Focused Product Pages"
                      />
                      <Input
                        id={`project-url-${projectIndex}`}
                        label="URL"
                        value={project.url || ''}
                        onChange={(event) => {
                          updateProject(projectIndex, { url: event.target.value });
                        }}
                        placeholder="https://example.com"
                      />
                    </div>

                    <Textarea
                      id={`project-description-${projectIndex}`}
                      label="Description"
                      value={project.description}
                      onChange={(event) => {
                        updateProject(projectIndex, { description: event.target.value });
                      }}
                      rows={3}
                      placeholder="Describe impact and outcomes..."
                    />

                    <Input
                      id={`project-technologies-${projectIndex}`}
                      label="Technologies (comma-separated)"
                      value={project.technologies.join(', ')}
                      onChange={(event) => {
                        updateProject(projectIndex, {
                          technologies: event.target.value
                            .split(',')
                            .map((value) => value.trim())
                            .filter(Boolean),
                        });
                      }}
                      placeholder="React, TypeScript, Vite"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="mt-5"
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        projects: current.projects.filter((_, index) => index !== projectIndex),
                      }));
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-2">
          <span className="annotation">skills</span>
          <Input
            id={`skills-${resume.id}`}
            label="Skills (comma-separated)"
            value={draft.skills.join(', ')}
            onChange={(event) => {
              const skills = event.target.value
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
              updateDraft((current) => ({ ...current, skills }));
            }}
            placeholder="React, TypeScript, Next.js"
          />
        </section>
      </div>
    </div>
  );
}
