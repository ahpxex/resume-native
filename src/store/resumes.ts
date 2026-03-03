import { atomWithStorage } from 'jotai/utils';
import type { GeneratedResume } from '../types';

export const resumesAtom = atomWithStorage<GeneratedResume[]>('resumes', [], undefined, { getOnInit: true });

export const activeResumeAtom = atomWithStorage<GeneratedResume | null>('activeResume', null, undefined, { getOnInit: true });
