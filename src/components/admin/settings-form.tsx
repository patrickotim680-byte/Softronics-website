'use client';

import { useActionState } from 'react';
import { saveSettingsAction } from '@/lib/actions/settings';
import { idleState } from '@/lib/actions/types';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';

export interface SettingsFieldDef {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
}

interface SettingsFormProps {
  settingsKey: string;
  title: string;
  description: string;
  fields: SettingsFieldDef[];
  values: Record<string, string>;
}

/**
 * Editable website copy. Each group maps to one row in site_settings, and the
 * server only accepts field names it already knows about.
 */
export function SettingsForm({
  settingsKey,
  title,
  description,
  fields,
  values,
}: SettingsFormProps) {
  const [state, formAction] = useActionState(saveSettingsAction, idleState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-line bg-surface p-6">
      <input type="hidden" name="key" value={settingsKey} />

      <div>
        <h2 className="text-lg font-semibold tracking-[-0.018em] text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </div>

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not saved">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>{state.message}</p>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            name={`${settingsKey}-${field.name}`}
            hint={field.hint}
            className={field.multiline ? 'sm:col-span-2' : undefined}
          >
            {field.multiline ? (
              <textarea
                {...fieldAria(`${settingsKey}-${field.name}`)}
                name={field.name}
                rows={3}
                maxLength={4000}
                defaultValue={values[field.name] ?? ''}
                className={`${controlClass} resize-y`}
              />
            ) : (
              <input
                {...fieldAria(`${settingsKey}-${field.name}`)}
                name={field.name}
                type="text"
                maxLength={4000}
                defaultValue={values[field.name] ?? ''}
                className={controlClass}
              />
            )}
          </Field>
        ))}
      </div>

      <SubmitButton label="Save changes" pendingLabel="Saving…" size="sm" />
    </form>
  );
}
