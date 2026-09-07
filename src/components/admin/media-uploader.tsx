'use client';

import { useActionState, useRef } from 'react';
import { uploadMediaAction } from '@/lib/actions/media';
import { idleState } from '@/lib/actions/types';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';

/** Upload form. The 5 MB and MIME-type limits are enforced again on the server. */
export function MediaUploader() {
  const [state, formAction] = useActionState(uploadMediaAction, idleState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="space-y-4 rounded-lg border border-line bg-surface p-5"
    >
      <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
        Upload image
      </h2>

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Upload failed">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>{state.message}</p>
        </Alert>
      )}

      <Field
        label="File"
        name="file"
        required
        error={errors.file}
        hint="PNG, JPEG, WebP, AVIF, GIF or SVG. Maximum 5 MB."
      >
        <input
          {...fieldAria('file', 'file', errors.file)}
          type="file"
          required
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
          className="w-full cursor-pointer rounded-md border border-line bg-canvas px-3 py-2.5 text-sm file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
        />
      </Field>

      <Field
        label="Alt text"
        name="alt_text"
        error={errors.alt_text}
        hint="Describe the image for screen readers. Leave empty for decorative images."
      >
        <input
          {...fieldAria('alt_text', 'alt_text', errors.alt_text)}
          type="text"
          maxLength={300}
          className={controlClass}
        />
      </Field>

      <SubmitButton label="Upload" pendingLabel="Uploading…" className="w-full" />
    </form>
  );
}
