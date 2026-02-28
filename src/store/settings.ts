import { atomWithStorage } from 'jotai/utils';
import type { LLMSettings } from '../types';

const defaultSettings: LLMSettings = {
  provider: 'openai-compatible',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
};

export const llmSettingsAtom = atomWithStorage<LLMSettings>('llmSettings', defaultSettings, undefined, { getOnInit: true });
