import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { GeneratedResume } from '../types';

export const resumesAtom = atomWithStorage<GeneratedResume[]>('resumes', [], undefined, { getOnInit: true });

export const activeResumeAtom = atom<GeneratedResume | null>(null);
