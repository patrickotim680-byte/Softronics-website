import 'server-only';

import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env';
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
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) return null;

  const allowed = serverEnv.adminAllowedEmails();
  if (allowed.length > 0 && !allowed.includes(user.email.toLowerCase())) {
    return null;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const admin = data as AdminUser;
  if (!admin.is_active) return null;

  return { userId: user.id, email: user.email, admin };
}

/** Page/Server Action guard. Redirects unauthenticated users to the login page. */
export async function requireAdmin(nextPath?: string): Promise<AdminSession> {
  const session = await getAdminSession();
  if (session) return session;

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
