import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Profile } from '../types';

export const profilesAtom = atomWithStorage<Profile[]>('profiles', [], undefined, { getOnInit: true });

export const profileByIdAtom = atom((get) => {
  const profiles = get(profilesAtom);
  return (id: string) => profiles.find((p) => p.id === id);
});
