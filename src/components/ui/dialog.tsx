import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-canvas/80 backdrop:backdrop-blur-sm bg-transparent p-0 m-0 max-w-none max-h-none"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            'w-full max-w-lg max-h-[85vh] flex flex-col',
            'rounded border border-dashed border-border-dashed bg-surface crop-marks',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-dashed border-border-dashed px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
              <h2 className="font-mono text-xs uppercase tracking-wider text-text">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-text-dim hover:text-text-muted hover:bg-surface-raised transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
