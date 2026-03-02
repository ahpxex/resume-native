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
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <span className="annotation">configuration</span>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block h-1 w-1 rounded-full bg-accent/60" />
          <span className="font-mono text-[10px] text-text-dim">llm provider settings</span>
        </div>
      </div>

      <div className="mb-6 border-t border-dashed border-border-dashed" />

      <Card marked>
        <CardHeader>
          <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted">
            Provider
          </h2>
          <p className="mt-1 font-mono text-[10px] text-text-dim">
            Works with any OpenAI-compatible API -- OpenAI, OpenRouter, Groq, Ollama, etc.
          </p>
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

          <div className="border-t border-dashed border-border-dashed pt-4">
            <div className="flex items-center gap-3">
              <Button onClick={testConnection} disabled={testing || !settings.apiKey} variant="secondary">
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              {testResult && (
                <span
                  className={`font-mono text-[10px] ${
                    testResult.startsWith('Error') ? 'text-danger' : 'text-success'
                  }`}
                >
                  {testResult}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-16" />
    </div>
  );
}
