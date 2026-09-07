import 'server-only';

import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env';
import { isMissingTableError } from '@/lib/admin-bootstrap';
import type { AdminUser } from '@/types/database';

export interface AdminSession {
  userId: string;
  email: string;
  admin: AdminUser;
}

/**
 * Resolves the current admin session, or null.
 *
 * Two independent gates must pass:
 *   1. a valid Supabase Auth session (verified against the auth server, not
 *      just decoded from a cookie)
 *   2. an active row in public.admin_users
 * If ADMIN_ALLOWED_EMAILS is set, the email must also appear in that list.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const access = await resolveAdminAccess();
  return access.session;
}

export type AdminAccessDenial = 'unauthenticated' | 'unauthorized' | 'tables_missing';

export interface AdminAccess {
  session: AdminSession | null;
  /** Why access was denied, so callers can send the visitor to the right place. */
  denial: AdminAccessDenial | null;
}

/**
 * Like getAdminSession, but distinguishes "no session at all" from "signed in
 * to Supabase yet not an administrator". The distinction matters: a signed-in
 * non-admin must be signed OUT before being shown the login page, otherwise the
 * middleware (which only knows about Supabase sessions) bounces them straight
 * back to /admin and the browser reports a redirect loop.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  const supabase = await getServerSupabase();
  if (!supabase) return { session: null, denial: 'unauthenticated' };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) return { session: null, denial: 'unauthenticated' };

  const allowed = serverEnv.adminAllowedEmails();
  if (allowed.length > 0 && !allowed.includes(user.email.toLowerCase())) {
    return { session: null, denial: 'unauthorized' };
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return { session: null, denial: isMissingTableError(error) ? 'tables_missing' : 'unauthorized' };
  }
  if (!data) return { session: null, denial: 'unauthorized' };

  const admin = data as AdminUser;
  if (!admin.is_active) return { session: null, denial: 'unauthorized' };

  return { session: { userId: user.id, email: user.email, admin }, denial: null };
}

/**
 * Page/Server Action guard.
 * - no session          -> /admin/login (preserving the requested path)
 * - session, not admin  -> /admin/sign-out, which clears the cookie and then
 *                          shows the login page with an explanation
 */
export async function requireAdmin(nextPath?: string): Promise<AdminSession> {
  const { session, denial } = await resolveAdminAccess();
  if (session) return session;

  if (denial === 'unauthorized' || denial === 'tables_missing') {
    redirect(`/admin/sign-out?reason=${denial}`);
  }

  const target = nextPath ? `/admin/login?next=${encodeURIComponent(nextPath)}` : '/admin/login';
  redirect(target);
}

/** Guard for actions that must not run for editors (e.g. managing admins). */
export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.admin.role !== 'owner') {
    redirect('/admin/unauthorized');
  }
  return session;
}

export function canManageTeam(session: AdminSession | null): boolean {
  return session?.admin.role === 'owner';
}
