import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

const REASONS = new Set(['unauthorized', 'tables_missing']);

/**
 * Clears the Supabase session and lands on the login page.
 *
 * Route Handlers may write cookies (Server Components may not), which is why
 * requireAdmin sends signed-in non-admins here instead of straight to
 * /admin/login. The optional ?reason= is echoed to the login page so it can
 * explain what happened.
 */
export async function GET(request: NextRequest) {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();

  const reason = request.nextUrl.searchParams.get('reason');
  const url = request.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  if (reason && REASONS.has(reason)) url.searchParams.set('reason', reason);

  return NextResponse.redirect(url);
}
