import { createOpenAI } from '@ai-sdk/openai';
import type { LLMSettings } from '../types';

export function getModel(settings: LLMSettings) {
  const provider = createOpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.baseUrl,
  });
  return provider(settings.model);
}
