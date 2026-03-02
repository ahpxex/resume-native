import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="annotation block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-text',
            'placeholder:text-text-dim',
            'focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20',
            'disabled:opacity-40',
            error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/20',
            className
          )}
          {...props}
        />
        {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
