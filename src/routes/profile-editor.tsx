import { useParams, useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { ArrowLeft } from 'lucide-react';
import { profilesAtom } from '../store/profiles';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { PersonalInfoForm } from '../components/profile/personal-info-form';
import { ExperienceSection } from '../components/profile/experience-section';
import { EducationSection } from '../components/profile/education-section';
import { ProjectsSection } from '../components/profile/projects-section';
import { SkillsSection } from '../components/profile/skills-section';
import { AiParser } from '../components/profile/ai-parser';
import type { Profile, WorkExperience, Education, Project } from '../types';

export function ProfileEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const profile = profiles.find((p) => p.id === id);

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-12 text-center bg-grid">
        <p className="annotation mb-4">profile not found</p>
        <p className="font-mono text-xs text-text-muted">
          The requested profile does not exist or has been removed.
        </p>
        <Button variant="secondary" size="sm" className="mt-6" onClick={() => navigate('/')}>
          <ArrowLeft className="h-3 w-3" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  function updateProfile(updates: Partial<Profile>) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
  }

  function handleAddExperience(items: WorkExperience[]) {
    updateProfile({ workExperience: [...profile!.workExperience, ...items] });
  }

  function handleAddEducation(items: Education[]) {
    updateProfile({ education: [...profile!.education, ...items] });
  }

  function handleAddProject(items: Project[]) {
    updateProfile({ projects: [...profile!.projects, ...items] });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 bg-grid min-h-screen">
      {/* Top bar: back + profile name + AI parse */}
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <div className="mx-2 h-4 w-px bg-border-dashed" />

        <div className="flex-1">
          <Input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="border-none bg-transparent font-mono text-lg text-text p-0 shadow-none focus:ring-0 focus:border-transparent"
            placeholder="Profile Name"
          />
        </div>

        <AiParser
          onAddExperience={handleAddExperience}
          onAddEducation={handleAddEducation}
          onAddProject={handleAddProject}
        />
      </div>

      <div className="space-y-10">
        {/* Personal Information */}
        <section>
          <div className="annotation mb-3 pl-1">personal information</div>
          <Card marked>
            <CardHeader>
              <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Contact Details
              </h2>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm
                value={profile.personalInfo}
                onChange={(personalInfo) => updateProfile({ personalInfo })}
              />
            </CardContent>
          </Card>
        </section>

        {/* Experience */}
        <section>
          <div className="annotation mb-3 pl-1">work experience</div>
          <ExperienceSection
            items={profile.workExperience}
            onChange={(workExperience) => updateProfile({ workExperience })}
          />
        </section>

        {/* Education */}
        <section>
          <div className="annotation mb-3 pl-1">education</div>
          <EducationSection
            items={profile.education}
            onChange={(education) => updateProfile({ education })}
          />
        </section>

        {/* Projects */}
        <section>
          <div className="annotation mb-3 pl-1">projects</div>
          <ProjectsSection
            items={profile.projects}
            onChange={(projects) => updateProfile({ projects })}
          />
        </section>

        {/* Skills */}
        <section>
          <div className="annotation mb-3 pl-1">skills</div>
          <SkillsSection
            items={profile.skills}
            onChange={(skills) => updateProfile({ skills })}
          />
        </section>
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </div>
  );
}
