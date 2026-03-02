import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Select({
  label,
  error,
  options,
  value,
  placeholder = 'Select...',
  onChange,
  className,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  function handleSelect(val: string) {
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div className={cn('space-y-1.5', className)} ref={containerRef}>
      {label && <span className="annotation block">{label}</span>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between rounded border border-border bg-surface px-3 py-2 text-left font-mono text-xs',
            'transition-colors hover:border-border-dashed focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20',
            open && 'border-accent/40 ring-1 ring-accent/20',
            error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span className={selected ? 'text-text' : 'text-text-dim'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3 text-text-muted transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded border border-border bg-surface shadow-sm">
            {options.length === 0 ? (
              <div className="px-3 py-2 font-mono text-[10px] text-text-dim">No options</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left font-mono text-xs transition-colors',
                    'hover:bg-accent-muted',
                    opt.value === value
                      ? 'text-accent'
                      : 'text-text'
                  )}
                >
                  {opt.value === value && (
                    <span className="mr-2 inline-block h-1 w-1 rounded-full bg-accent" />
                  )}
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
    </div>
  );
}
