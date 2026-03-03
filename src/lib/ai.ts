import { createOpenAI } from '@ai-sdk/openai';
import type { LLMSettings } from '../types';

export function getModel(settings: LLMSettings) {
  if (!settings.apiKey.trim() || !settings.baseUrl.trim() || !settings.model.trim()) {
    throw new Error('Missing LLM settings: apiKey, baseUrl, and model are required.');
  }

  const provider = createOpenAI({
    apiKey: settings.apiKey,
    baseURL: settings.baseUrl,
  });
  // Chat Completions has the broadest support across OpenAI-compatible providers.
  return provider.chat(settings.model);
}
