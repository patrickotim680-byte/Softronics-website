import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const controlClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-[0.9375rem] text-ink placeholder:text-faint transition-colors duration-150 ease-out hover:border-ink/25 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:bg-raised disabled:text-muted';

interface FieldProps {
  label: string;
  name: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Label + control + hint/error, wired with aria attributes for screen readers. */
export function Field({ label, name, children, hint, error, required, className }: FieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-1 text-signal-red" aria-hidden="true">
            *
          </span>
        )}
        {!required && <span className="ml-2 text-xs font-normal text-faint">optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-signal-red">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldAria(name: string, hint?: string, error?: string) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(' ');
  return {
    id: name,
    name,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy.length > 0 ? describedBy : undefined,
  } as const;
}
