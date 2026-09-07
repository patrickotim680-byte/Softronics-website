import 'server-only';

import { serverEnv } from '@/lib/env';

/**
 * Outbound email.
 *
 * Disabled unless EMAIL_PROVIDER is set. When disabled, submissions are still
 * stored in the database and visible in /admin/messages: the notification is an
 * enhancement, never the system of record. Resend is implemented over plain
 * fetch so no extra dependency is required.
 */
export interface EmailMessage {
  subject: string;
  text: string;
  replyTo?: string;
}

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: 'disabled' | 'misconfigured' | 'failed'; detail?: string };

export async function sendAdminNotification(message: EmailMessage): Promise<EmailResult> {
  const provider = serverEnv.email.provider();
  if (!provider) return { sent: false, reason: 'disabled' };

  if (provider !== 'resend') {
    return { sent: false, reason: 'misconfigured', detail: `Unknown EMAIL_PROVIDER "${provider}"` };
  }

  const apiKey = serverEnv.email.resendApiKey();
  const from = serverEnv.email.from();
  const to = serverEnv.email.to();

  if (!apiKey || !from || !to) {
    return {
      sent: false,
      reason: 'misconfigured',
      detail: 'RESEND_API_KEY, EMAIL_FROM and EMAIL_TO are all required.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((entry) => entry.trim()).filter(Boolean),
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('[email] provider rejected the request:', response.status, detail);
      return { sent: false, reason: 'failed', detail: `HTTP ${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error('[email] send failed:', error);
    return { sent: false, reason: 'failed', detail: 'Network error' };
  }
}
