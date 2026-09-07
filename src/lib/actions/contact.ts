'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { contactSchema, fieldErrors } from '@/lib/validation/schemas';
import { getServiceSupabase } from '@/lib/supabase/server';
import { sendAdminNotification } from '@/lib/email';
import { hashIdentifier, rateLimit } from '@/lib/rate-limit';
import { INQUIRY_TYPES } from '@/lib/constants';
import { errorState, successState, type ActionState } from './types';
import { text } from './form';

/**
 * Public contact form.
 *
 * Defence in depth:
 *   1. honeypot field
 *   2. per-IP rate limit
 *   3. server-side Zod validation (the browser check is only a convenience)
 *   4. insert through the service-role client, because contact_messages has no
 *      anon policy: the public API cannot be used as a spam endpoint
 *   5. only a truncated hash of the IP is stored, never the address itself
 */
export async function submitContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values: Record<string, string> = {
    name: text(formData, 'name'),
    organization: text(formData, 'organization'),
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    inquiry_type: text(formData, 'inquiry_type'),
    message: text(formData, 'message'),
  };

  const parsed = contactSchema.safeParse({
    ...values,
    inquiry_type: values.inquiry_type || 'general',
    company_website: text(formData, 'company_website'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please correct the fields below.',
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for') ?? '';
  const clientIp = forwardedFor.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
  const userAgent = headerList.get('user-agent')?.slice(0, 300) ?? null;

  const limit = rateLimit(`contact:${clientIp}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      status: 'error',
      message: `Too many submissions. Try again in about ${Math.ceil(limit.retryAfterSeconds / 60)} minutes, or email us directly.`,
      values,
    };
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return {
      status: 'error',
      message:
        'The contact form is not connected yet. Please email us directly while this is being configured.',
      values,
    };
  }

  const ipHash = clientIp === 'unknown' ? null : await hashIdentifier(clientIp);

  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    organization: parsed.data.organization,
    email: parsed.data.email,
    phone: parsed.data.phone,
    inquiry_type: parsed.data.inquiry_type,
    message: parsed.data.message,
    user_agent: userAgent,
    ip_hash: ipHash,
    source: 'website',
  });

  if (error) {
    console.error('[contact] insert failed:', error.message);
    return errorState('Something went wrong on our side. Please try again or email us directly.');
  }

  const label =
    INQUIRY_TYPES.find((entry) => entry.value === parsed.data.inquiry_type)?.label ?? 'Inquiry';

  // Notification is best effort. The message is already stored.
  const result = await sendAdminNotification({
    subject: `[Softronics] ${label} from ${parsed.data.name}`,
    replyTo: parsed.data.email,
    text: [
      `Type: ${label}`,
      `Name: ${parsed.data.name}`,
      `Organization: ${parsed.data.organization ?? '-'}`,
      `Email: ${parsed.data.email}`,
      `Phone: ${parsed.data.phone ?? '-'}`,
      '',
      parsed.data.message,
    ].join('\n'),
  });

  if (!result.sent && result.reason === 'failed') {
    console.warn('[contact] stored, but notification email failed:', result.detail);
  }

  revalidatePath('/admin/messages');
  revalidatePath('/admin');

  return successState(
    'Thank you. Your message has been received and we will reply to the email address you provided.',
  );
}
