import { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/60',
  secondary:
    'border border-dashed border-border-dashed text-text-muted hover:text-text hover:bg-surface-raised',
  ghost:
    'text-text-muted hover:text-text hover:bg-surface-raised',
  danger:
    'border border-danger/30 bg-danger-muted text-danger hover:bg-danger/20 hover:border-danger/50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-[11px]',
  lg: 'px-4 py-2 text-xs',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded font-mono uppercase tracking-wider transition-all',
        'focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent/50',
        'disabled:pointer-events-none disabled:opacity-30',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
