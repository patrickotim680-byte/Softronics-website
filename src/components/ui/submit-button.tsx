'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './button';
import type { ComponentProps } from 'react';

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, 'type'> {
  label: string;
  pendingLabel?: string;
}

/**
 * Submit control that reflects real pending state from the enclosing form,
 * so the user always knows whether a Server Action is still running.
 */
export function SubmitButton({ label, pendingLabel, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? (pendingLabel ?? 'Saving…') : label}
    </Button>
  );
}
