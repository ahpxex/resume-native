import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Scenario } from '../types';

export const scenariosAtom = atomWithStorage<Scenario[]>('scenarios', [], undefined, { getOnInit: true });

export const scenariosByProfileAtom = atom((get) => {
  const scenarios = get(scenariosAtom);
  return (profileId: string) => scenarios.filter((s) => s.profileId === profileId);
});

export const scenarioByIdAtom = atom((get) => {
  const scenarios = get(scenariosAtom);
  return (id: string) => scenarios.find((s) => s.id === id);
});
