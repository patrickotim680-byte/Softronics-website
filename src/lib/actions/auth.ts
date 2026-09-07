'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { AuthError } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured, serverEnv } from '@/lib/env';
import { isSafeInternalPath } from '@/lib/utils';
import {
  confirmAllowlistedUser,
  isMissingTableError,
  provisionAdminUser,
} from '@/lib/admin-bootstrap';
import { errorState, type ActionState } from './types';
import { text } from './form';

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const INVALID_CREDENTIALS = 'Invalid email or password.';

const MIGRATIONS_REQUIRED =
  'The dashboard database tables do not exist yet. In the Supabase SQL editor run ' +
  'supabase/migrations/0001_init.sql, then 0002_rls.sql, then 0003_admin_allowlist.sql, ' +
  'and sign in again.';

const NOT_ALLOWLISTED =
  'This email address is not on the administrator allowlist. Add it to the ' +
  'ADMIN_ALLOWED_EMAILS environment variable (or the admin_allowlist table) and try again.';

function isEmailNotConfirmed(error: AuthError): boolean {
  const code = (error as AuthError & { code?: string }).code;
  return code === 'email_not_confirmed' || /not confirmed/i.test(error.message);
}

function isInvalidCredentials(error: AuthError): boolean {
  const code = (error as AuthError & { code?: string }).code;
  return code === 'invalid_credentials' || /invalid login credentials/i.test(error.message);
}

/**
 * Password sign-in for the dashboard.
 *
 * Passwords are handled entirely by Supabase Auth (hashed, never stored in this
 * codebase). Two gates must pass:
 *   1. Supabase Auth accepts the credentials
 *   2. the user has an active row in public.admin_users
 *
 * Wrong-password and unknown-email both map to the same generic message so the
 * form cannot be used to enumerate accounts. Configuration problems (missing
 * tables, allowlist, unconfirmed email) are reported explicitly because they
 * reveal nothing about which accounts exist and are otherwise undebuggable.
 */
export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return errorState('Supabase is not configured yet. See the setup notice below.');
  }

  const parsed = credentialsSchema.safeParse({
    email: text(formData, 'email'),
    password: text(formData, 'password'),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { status: 'error', message: 'Check the fields below.', errors };
  }

  const { email, password } = parsed.data;

  const envAllowlist = serverEnv.adminAllowedEmails();
  if (envAllowlist.length > 0 && !envAllowlist.includes(email)) {
    console.warn('[auth] sign-in rejected: email is not in ADMIN_ALLOWED_EMAILS');
    return errorState(NOT_ALLOWLISTED);
  }

  const supabase = await getServerSupabase();
  if (!supabase) return errorState('Supabase is not configured yet.');

  let result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error && isEmailNotConfirmed(result.error)) {
    // The password was already verified by Supabase; only confirmation is
    // outstanding. Confirm allowlisted operator accounts and retry once.
    const confirmed = await confirmAllowlistedUser(email);
    if (confirmed) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      return errorState(
        'This account has not confirmed its email address yet. Open the confirmation ' +
          'email, or ask an owner to confirm the account.',
      );
    }
  }

  if (result.error || !result.data.user) {
    if (result.error && !isInvalidCredentials(result.error)) {
      console.error('[auth] unexpected sign-in error:', result.error.message);
      return errorState(`Sign in failed unexpectedly: ${result.error.message}`);
    }
    return errorState(INVALID_CREDENTIALS);
  }

  const user = result.data.user;

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();
    if (isMissingTableError(adminError)) return errorState(MIGRATIONS_REQUIRED);
    console.error('[auth] could not read admin_users:', adminError.message);
    return errorState(`Could not verify your administrator profile: ${adminError.message}`);
  }

  let admin = adminRow as { id: string; is_active: boolean } | null;

  if (!admin) {
    const provisioned = await provisionAdminUser(user.id, email);

    if (!provisioned.ok) {
      await supabase.auth.signOut();
      switch (provisioned.reason) {
        case 'tables_missing':
          return errorState(MIGRATIONS_REQUIRED);
        case 'not_allowlisted':
          return errorState(NOT_ALLOWLISTED);
        case 'no_service_key':
          return errorState(
            'This account is not authorized to use the Softronics dashboard. ' +
              'Set SUPABASE_SERVICE_ROLE_KEY so allowlisted accounts can be provisioned automatically.',
          );
        default:
          console.error('[auth] provisioning failed:', provisioned.detail);
          return errorState(
            `This account is not authorized to use the Softronics dashboard (${provisioned.detail ?? 'unknown error'}).`,
          );
      }
    }

    admin = { id: user.id, is_active: true };
  }

  if (admin.is_active !== true) {
    await supabase.auth.signOut();
    return errorState('This account has been deactivated. Ask an owner to re-enable it.');
  }

  await supabase
    .from('admin_users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', user.id);

  const requested = text(formData, 'next');
  const destination = isSafeInternalPath(requested) ? requested : '/admin';

  revalidatePath('/admin', 'layout');
  redirect(destination);
}

export async function signOutAction(): Promise<void> {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
