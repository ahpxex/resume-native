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
      className="backdrop:bg-black/50 bg-transparent p-0 m-0 max-w-none max-h-none"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn('bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col', className)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-4">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
