'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './button';
import type { ComponentProps } from 'react';

interface ConfirmSubmitProps extends Omit<ComponentProps<typeof Button>, 'type' | 'onClick'> {
  label: string;
  confirmMessage: string;
  pendingLabel?: string;
}

/**
 * Destructive submit control. Requires an explicit confirmation before the
 * Server Action runs, so a stray click cannot delete content.
 */
export function ConfirmSubmit({
  label,
  confirmMessage,
  pendingLabel,
  variant = 'danger',
  size = 'sm',
  ...props
}: ConfirmSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      {...props}
    >
      {pending ? (pendingLabel ?? 'Working…') : label}
    </Button>
  );
}
