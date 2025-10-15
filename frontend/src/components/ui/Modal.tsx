import type { PropsWithChildren, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Button } from './Button';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, footer, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-3 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        <button
          aria-label="Close modal"
          className={clsx(
            'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700'
          )}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        {(title || description) && (
          <header className="mb-4 space-y-1.5">
            {title ? <h2 className="text-lg font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
          </header>
        )}
        <div className="space-y-4 text-sm text-neutral-600">{children}</div>
        <footer className="mt-6 flex justify-end gap-3">
          {footer ?? (
            <>
              <Button variant="ghost" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="button">Confirm</Button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
