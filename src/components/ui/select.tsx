import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="annotation block">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-text',
            'focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20',
            error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
