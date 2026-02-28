import { useAtom } from 'jotai';
import { useNavigate } from 'react-router';
import { Plus, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { profilesAtom } from '../store/profiles';
import { scenariosAtom } from '../store/scenarios';
import { resumesAtom } from '../store/resumes';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { generateId } from '../lib/utils';
import type { Profile } from '../types';

export function Dashboard() {
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const [scenarios] = useAtom(scenariosAtom);
  const [resumes, setResumes] = useAtom(resumesAtom);
  const navigate = useNavigate();

  function createProfile() {
    const now = Date.now();
    const profile: Profile = {
      id: generateId(),
      name: 'New Profile',
      personalInfo: { fullName: '', email: '' },
      workExperience: [],
      education: [],
      projects: [],
      skills: [],
      createdAt: now,
      updatedAt: now,
    };
    setProfiles((prev) => [...prev, profile]);
    navigate(`/profiles/${profile.id}`);
  }

  function deleteProfile(id: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setResumes((prev) => prev.filter((r) => r.profileId !== id));
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your profiles and generate tailored resumes.</p>
        </div>
        <Button onClick={createProfile}>
          <Plus className="h-4 w-4" />
          New Profile
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-zinc-300" />
            <h3 className="text-lg font-medium text-zinc-900">No profiles yet</h3>
            <p className="mt-1 text-sm text-zinc-500">Create your first profile to get started.</p>
            <Button className="mt-4" onClick={createProfile}>
              <Plus className="h-4 w-4" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const profileScenarios = scenarios.filter((s) => s.profileId === profile.id);
            const profileResumes = resumes.filter((r) => r.profileId === profile.id);
            return (
              <Card key={profile.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 font-semibold">
                    {profile.personalInfo.fullName?.[0]?.toUpperCase() || profile.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-zinc-900 truncate">{profile.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {profile.personalInfo.fullName || 'No name set'}
                      {' -- '}
                      {profileScenarios.length} scenario{profileScenarios.length !== 1 ? 's' : ''}
                      {', '}
                      {profileResumes.length} resume{profileResumes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profile.id}/scenarios`)}>
                      Scenarios
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteProfile(profile.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/profiles/${profile.id}`)}>
                      Edit
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
