import 'server-only';

import type { PostgrestError } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env';
import type { AdminRole } from '@/types/database';

/**
 * Server-side repair paths for the dashboard sign-in flow.
 *
 * Both helpers only ever act on emails that the operator has explicitly
 * allowlisted (ADMIN_ALLOWED_EMAILS env var or public.admin_allowlist table),
 * and both require the service-role key, which never reaches the browser.
 */

const ROLES: AdminRole[] = ['owner', 'admin', 'editor'];

/** PostgREST / Postgres signals that the migrations have not been applied. */
export function isMissingTableError(error: PostgrestError | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  return /does not exist|schema cache/i.test(error.message ?? '');
}

export interface AllowlistLookup {
  allowed: boolean;
  role: AdminRole | null;
  tablesMissing: boolean;
}

/**
 * Checks whether an email is permitted to hold a dashboard account.
 * The env allowlist is authoritative when set; the table is consulted for the
 * role and as a fallback when the env var is empty.
 */
export async function lookupAllowlist(email: string): Promise<AllowlistLookup> {
  const normalized = email.toLowerCase();
  const envAllowed = serverEnv.adminAllowedEmails();
  const inEnv = envAllowed.includes(normalized);

  const service = getServiceSupabase();
  if (!service) {
    return { allowed: inEnv, role: null, tablesMissing: false };
  }

  const { data, error } = await service
    .from('admin_allowlist')
    .select('email, role')
    .ilike('email', normalized)
    .maybeSingle();

  if (error) {
    return { allowed: inEnv, role: null, tablesMissing: isMissingTableError(error) };
  }

  const row = data as { email: string; role: string } | null;
  const role = row && ROLES.includes(row.role as AdminRole) ? (row.role as AdminRole) : null;

  return { allowed: inEnv || row !== null, role, tablesMissing: false };
}

/**
 * Marks an allowlisted auth user's email as confirmed.
 *
 * Supabase verifies the password BEFORE it checks confirmation status, so this
 * only runs for someone who already proved they know the password of an
 * account the operator created. Returns true when the user was confirmed.
 */
export async function confirmAllowlistedUser(email: string): Promise<boolean> {
  const service = getServiceSupabase();
  if (!service) return false;

  const { allowed } = await lookupAllowlist(email);
  if (!allowed) return false;

  const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error('[auth] could not list users to confirm email:', error.message);
    return false;
  }

  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!match) return false;
  if (match.email_confirmed_at) return true;

  const { error: updateError } = await service.auth.admin.updateUserById(match.id, {
    email_confirm: true,
  });

  if (updateError) {
    console.error('[auth] could not confirm email:', updateError.message);
    return false;
  }

  return true;
}

export type ProvisionResult =
  | { ok: true }
  | { ok: false; reason: 'not_allowlisted' | 'tables_missing' | 'no_service_key' | 'error'; detail?: string };

/**
 * Creates the public.admin_users row for an authenticated, allowlisted user.
 * This is the application-level fallback for the database trigger in
 * 0003_admin_allowlist.sql, which managed Supabase projects sometimes refuse to
 * attach to auth.users.
 */
export async function provisionAdminUser(userId: string, email: string): Promise<ProvisionResult> {
  const service = getServiceSupabase();
  if (!service) return { ok: false, reason: 'no_service_key' };

  const allowlist = await lookupAllowlist(email);
  if (allowlist.tablesMissing) return { ok: false, reason: 'tables_missing' };
  if (!allowlist.allowed) return { ok: false, reason: 'not_allowlisted' };

  let role: AdminRole = allowlist.role ?? 'admin';

  if (!allowlist.role) {
    // The very first administrator becomes the owner so the team can be managed
    // from the dashboard without touching the database again.
    const { count, error } = await service
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return isMissingTableError(error)
        ? { ok: false, reason: 'tables_missing' }
        : { ok: false, reason: 'error', detail: error.message };
    }
    if ((count ?? 0) === 0) role = 'owner';
  }

  const { error } = await service.from('admin_users').upsert(
    {
      id: userId,
      email: email.toLowerCase(),
      full_name: email.split('@')[0],
      role,
      is_active: true,
    },
    { onConflict: 'id' },
  );

  if (error) {
    return isMissingTableError(error)
      ? { ok: false, reason: 'tables_missing' }
      : { ok: false, reason: 'error', detail: error.message };
  }

  return { ok: true };
}
