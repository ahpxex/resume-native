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
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="annotation">profiles</span>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-xs text-text-muted">
              {profiles.length} registered
            </span>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={createProfile}>
          <Plus className="h-3.5 w-3.5" />
          New Profile
        </Button>
      </div>

      {/* Divider */}
      <div className="mb-6 border-t border-dashed border-border-dashed" />

      {profiles.length === 0 ? (
        /* Empty state */
        <Card marked>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded border border-dashed border-border-dashed">
              <FileText className="h-5 w-5 text-text-dim" />
            </div>
            <span className="annotation">no profiles found</span>
            <p className="mt-2 max-w-xs font-mono text-[11px] leading-relaxed text-text-dim">
              Create your first profile to begin generating tailored resumes for
              different scenarios.
            </p>
            <Button className="mt-5" variant="primary" size="md" onClick={createProfile}>
              <Plus className="h-3.5 w-3.5" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Profile list */
        <div className="space-y-3">
          {profiles.map((profile) => {
            const profileScenarios = scenarios.filter(
              (s) => s.profileId === profile.id
            );
            const profileResumes = resumes.filter(
              (r) => r.profileId === profile.id
            );
            const initial =
              profile.personalInfo.fullName?.[0]?.toUpperCase() ||
              profile.name[0]?.toUpperCase() ||
              '?';

            return (
              <Card key={profile.id} marked>
                <CardContent className="flex items-center gap-4">
                  {/* Letter indicator */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border-dashed font-mono text-xs text-text-muted">
                    {initial}
                  </div>

                  {/* Profile info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-text">
                        {profile.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="annotation">
                        {profileScenarios.length} scenario
                        {profileScenarios.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-text-dim">/</span>
                      <span className="annotation">
                        {profileResumes.length} resume
                        {profileResumes.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/profiles/${profile.id}/scenarios`)
                      }
                    >
                      Scenarios
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/profiles/${profile.id}`)}
                    >
                      Edit
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProfile(profile.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-danger" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer annotation */}
      <div className="mt-8 flex items-center justify-between">
        <span className="annotation">
          last updated -- {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase()}
        </span>
        <span className="annotation">resume-native v0</span>
      </div>
    </div>
  );
}
