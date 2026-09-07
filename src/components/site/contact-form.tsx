'use client';

import { useActionState } from 'react';
import { submitContactAction } from '@/lib/actions/contact';
import { idleState } from '@/lib/actions/types';
import { INQUIRY_TYPES } from '@/lib/constants';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import type { InquiryType } from '@/types/database';

/**
 * Public contact form.
 *
 * Progressive enhancement: this is a real <form> bound to a Server Action, so it
 * submits and validates even before hydration finishes. The browser does a first
 * pass with native constraints; the server revalidates everything with Zod.
 */
export function ContactForm({ defaultInquiry = 'general' }: { defaultInquiry?: InquiryType }) {
  const [state, formAction] = useActionState(submitContactAction, idleState);
  const errors = state.errors ?? {};
  const values = state.values ?? {};

  if (state.status === 'success') {
    return (
      <Alert tone="success" title="Message sent">
        <p>{state.message}</p>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not sent">
          <p>{state.message}</p>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required error={errors.name}>
          <input
            {...fieldAria('name', undefined, errors.name)}
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            defaultValue={values.name}
            className={controlClass}
          />
        </Field>

        <Field label="Organization" name="organization" error={errors.organization}>
          <input
            {...fieldAria('organization', undefined, errors.organization)}
            type="text"
            autoComplete="organization"
            maxLength={160}
            defaultValue={values.organization}
            className={controlClass}
          />
        </Field>

        <Field label="Email" name="email" required error={errors.email}>
          <input
            {...fieldAria('email', undefined, errors.email)}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={values.email}
            className={controlClass}
          />
        </Field>

        <Field label="Phone" name="phone" error={errors.phone} hint="Include the country code.">
          <input
            {...fieldAria('phone', 'phone', errors.phone)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={40}
            defaultValue={values.phone}
            className={controlClass}
          />
        </Field>
      </div>

      <Field label="Type of inquiry" name="inquiry_type" required error={errors.inquiry_type}>
        <select
          {...fieldAria('inquiry_type', undefined, errors.inquiry_type)}
          defaultValue={values.inquiry_type || defaultInquiry}
          className={controlClass}
        >
          {INQUIRY_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Message"
        name="message"
        required
        error={errors.message}
        hint="What problem are you trying to solve? Context helps us reply usefully."
      >
        <textarea
          {...fieldAria('message', 'message', errors.message)}
          rows={7}
          required
          minLength={20}
          maxLength={4000}
          defaultValue={values.message}
          className={`${controlClass} resize-y`}
        />
      </Field>

      {/* Honeypot. Hidden from users and screen readers, attractive to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <SubmitButton label="Send message" pendingLabel="Sending…" size="lg" />
        <p className="text-xs leading-relaxed text-muted">
          We use your details only to reply to this inquiry.
        </p>
      </div>
    </form>
  );
}
