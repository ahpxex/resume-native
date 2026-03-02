import { cn } from '../../lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
}

const templates: Template[] = [
  { id: 'classic', name: 'Classic', description: 'Single-column, traditional' },
  { id: 'modern', name: 'Modern', description: 'Two-column with sidebar' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, generous space' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function TemplatePicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="annotation block">Template</label>
      <div className="space-y-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'w-full rounded border border-dashed p-2.5 text-left transition-all',
              value === t.id
                ? 'border-accent/40 bg-accent/5'
                : 'border-border-dashed hover:border-border-dashed hover:bg-surface-raised'
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-6 items-center justify-center rounded border border-dashed',
                  value === t.id
                    ? 'border-accent/30 bg-accent/10'
                    : 'border-border-dashed bg-canvas'
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[8px]',
                    value === t.id ? 'text-accent' : 'text-text-dim'
                  )}
                >
                  {t.id[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p
                  className={cn(
                    'font-mono text-[11px] uppercase tracking-wider',
                    value === t.id ? 'text-accent' : 'text-text'
                  )}
                >
                  {t.name}
                </p>
                <p className="font-mono text-[9px] text-text-dim">{t.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
