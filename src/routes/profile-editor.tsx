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
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500">Profile not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <Input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="border-none bg-transparent text-2xl font-bold text-zinc-900 p-0 shadow-none focus:ring-0"
            placeholder="Profile Name"
          />
        </div>
        <AiParser
          onAddExperience={handleAddExperience}
          onAddEducation={handleAddEducation}
          onAddProject={handleAddProject}
        />
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-zinc-900">Personal Information</h2>
          </CardHeader>
          <CardContent>
            <PersonalInfoForm
              value={profile.personalInfo}
              onChange={(personalInfo) => updateProfile({ personalInfo })}
            />
          </CardContent>
        </Card>

        <ExperienceSection
          items={profile.workExperience}
          onChange={(workExperience) => updateProfile({ workExperience })}
        />

        <EducationSection
          items={profile.education}
          onChange={(education) => updateProfile({ education })}
        />

        <ProjectsSection
          items={profile.projects}
          onChange={(projects) => updateProfile({ projects })}
        />

        <SkillsSection
          items={profile.skills}
          onChange={(skills) => updateProfile({ skills })}
        />
      </div>
    </div>
  );
}
