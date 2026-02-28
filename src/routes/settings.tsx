import { useAtom } from 'jotai';
import { llmSettingsAtom } from '../store/settings';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { getModel } from '../lib/ai';
import { generateText } from 'ai';

export function SettingsPage() {
  const [settings, setSettings] = useAtom(llmSettingsAtom);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  function update(field: string, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const model = getModel(settings);
      const result = await generateText({
        model,
        prompt: 'Say "Connection successful!" and nothing else.',
      });
      setTestResult(result.text);
    } catch (e) {
      setTestResult(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Configure your LLM provider for AI-powered resume generation.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-zinc-900">LLM Provider</h2>
          <p className="text-sm text-zinc-500">Works with any OpenAI-compatible API (OpenAI, OpenRouter, Groq, Ollama, etc.)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="API Key"
            type="password"
            value={settings.apiKey}
            onChange={(e) => update('apiKey', e.target.value)}
            placeholder="sk-..."
          />
          <Input
            label="Base URL"
            value={settings.baseUrl}
            onChange={(e) => update('baseUrl', e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
          <Input
            label="Model"
            value={settings.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="gpt-4o-mini"
          />
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={testConnection} disabled={testing || !settings.apiKey} variant="secondary">
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            {testResult && (
              <span className={`text-sm ${testResult.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {testResult}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
