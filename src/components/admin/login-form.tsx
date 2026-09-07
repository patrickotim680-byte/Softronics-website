'use client';

import { useActionState } from 'react';
import { signInAction } from '@/lib/actions/auth';
import { idleState } from '@/lib/actions/types';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, idleState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Sign in failed">
          <p>{state.message}</p>
        </Alert>
      )}

      <Field label="Email" name="email" required error={errors.email}>
        <input
          {...fieldAria('email', undefined, errors.email)}
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={controlClass}
        />
      </Field>

      <Field label="Password" name="password" required error={errors.password}>
        <input
          {...fieldAria('password', undefined, errors.password)}
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className={controlClass}
        />
      </Field>

      <SubmitButton label="Sign in" pendingLabel="Signing in…" className="w-full" size="lg" />
    </form>
  );
}
