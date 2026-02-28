import { cn } from '../../lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
}

const templates: Template[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional single-column layout' },
  { id: 'modern', name: 'Modern', description: 'Two-column with sidebar' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, generous whitespace' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700">Template</label>
      <div className="grid grid-cols-3 gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'rounded-lg border-2 p-3 text-left transition-all',
              value === t.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-zinc-200 hover:border-zinc-300'
            )}
          >
            <div className="mb-2 h-16 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs text-zinc-400">
              {t.name}
            </div>
            <p className="text-sm font-medium text-zinc-900">{t.name}</p>
            <p className="text-xs text-zinc-500">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
