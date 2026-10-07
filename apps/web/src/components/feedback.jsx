import React, { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';

const listeners = new Set();

export function askUser({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  inputLabel,
  inputPlaceholder,
  requireInput = false,
}) {
  return new Promise((resolve) => {
    listeners.forEach((listener) => listener({
      title,
      message,
      confirmLabel,
      cancelLabel,
      tone,
      inputLabel,
      inputPlaceholder,
      requireInput,
      resolve,
    }));
  });
}

export const notify = {
  success: (message) => toast.success(message),
  info: (message) => toast.message(message),
  warning: (message) => toast.warning(message),
  error: (message) => toast.error(message),
};

export const FeedbackHost = () => {
  const [request, setRequest] = useState(null);
  const [value, setValue] = useState('');
  const closing = useRef(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const listener = (next) => {
      setValue('');
      setRequest(next);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const close = (result) => {
    if (!request || closing.current) return;
    closing.current = true;
    const current = request;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      current.resolve(result);
      closing.current = false;
      setRequest(null);
    };
    if (reduced) {
      finish();
      return;
    }
    setRequest({ ...current, leaving: true });
    window.setTimeout(finish, 160);
  };

  useEffect(() => {
    if (!request || request.leaving) return undefined;
    const node = dialogRef.current;
    const items = () => [...(node?.querySelectorAll('button, textarea, input') || [])].filter((item) => !item.disabled);
    items()[0]?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(request.requireInput ? null : false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = items();
      if (!focusable.length) return;
      const index = focusable.indexOf(document.activeElement);
      const next = event.shiftKey ? (index <= 0 ? focusable.length - 1 : index - 1) : (index >= focusable.length - 1 ? 0 : index + 1);
      event.preventDefault();
      focusable[next]?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [request]);

  const confirm = () => {
    if (request?.requireInput) {
      const trimmed = value.trim();
      if (!trimmed) return;
      close(trimmed);
      return;
    }
    close(true);
  };

  return (
    <>
      <Toaster
        position="top-right"
        closeButton
        duration={4200}
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-overlay)',
          },
        }}
      />
      {request && (
        <div className={`liquid-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-[#10151c]/45 p-4 sm:items-center ${request.leaving ? 'is-leaving' : ''}`} role="presentation" onMouseDown={() => close(request.requireInput ? null : false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="orison-dialog-title"
            ref={dialogRef}
            className={`orison-surface liquid-dialog w-full max-w-md p-5 shadow-[var(--shadow-float)] ${request.leaving ? 'is-leaving' : ''}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="orison-dialog-title" className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">{request.title}</h2>
            {request.message && <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">{request.message}</p>}
            {request.requireInput && (
              <label className="mt-4 block text-[12px] font-medium text-[var(--color-text-secondary)]">
                {request.inputLabel || 'Details'}
                <textarea
                  autoFocus
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={request.inputPlaceholder || ''}
                  className="mt-1.5 h-24 w-full resize-none rounded-[10px] border border-[var(--color-border)] px-3 py-2 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                />
              </label>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => close(request.requireInput ? null : false)} className="h-10 rounded-[10px] px-4 text-[13px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-secondary-soft)]">
                {request.cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirm}
                className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white ${request.tone === 'danger' ? 'bg-[var(--color-danger)] hover:bg-[#8f1d14]' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'}`}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
