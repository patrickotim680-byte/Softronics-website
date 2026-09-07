'use client';

import { useActionState } from 'react';
import { addAllowlistEntryAction } from '@/lib/actions/team';
import { idleState } from '@/lib/actions/types';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';

export function AllowlistForm() {
  const [state, formAction] = useActionState(addAllowlistEntryAction, idleState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-line bg-surface p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Authorize an administrator
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          This grants permission to an email address. The person then creates their own password
          through Supabase Auth, so no password is ever handled by this application.
        </p>
      </div>

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not added">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>{state.message}</p>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" required error={errors.email}>
          <input
            {...fieldAria('email', undefined, errors.email)}
            type="email"
            required
            className={controlClass}
          />
        </Field>

        <Field label="Role" name="role" required error={errors.role}>
          <select {...fieldAria('role', undefined, errors.role)} defaultValue="admin" className={controlClass}>
            <option value="owner">Owner (full access, can manage the team)</option>
            <option value="admin">Admin (all content)</option>
            <option value="editor">Editor (all content)</option>
          </select>
        </Field>

        <Field label="Note" name="note" error={errors.note} className="sm:col-span-2">
          <input
            {...fieldAria('note', undefined, errors.note)}
            type="text"
            maxLength={200}
            placeholder="Who this is, for future reference"
            className={controlClass}
          />
        </Field>
      </div>

      <SubmitButton label="Authorize" pendingLabel="Saving…" size="sm" />
    </form>
  );
}
