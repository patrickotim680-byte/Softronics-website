import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getServiceRoleKey, isSupabaseConfigured, publicEnv } from '@/lib/env';

/**
 * Request-scoped Supabase client for Server Components, Route Handlers and
 * Server Actions. Carries the signed-in user's session through cookies, so all
 * queries run under Row Level Security as that user.
 *
 * Returns null when Supabase is not configured yet, which lets pages render a
 * documented setup state instead of crashing.
 */
export async function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl!, publicEnv.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render, where cookies are read-only.
          // Session refresh is handled by middleware, so this is safe to ignore.
        }
      },
    },
  });
}

/** Throws instead of returning null. Use inside code paths that require the DB. */
export async function requireServerSupabase() {
  const supabase = await getServerSupabase();
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. See README "Configure environment variables".',
    );
  }
  return supabase;
}

/**
 * Anonymous, cookie-free client for public content.
 *
 * Because it never touches cookies, pages that use it stay statically
 * renderable (ISR) instead of being forced into dynamic rendering on every
 * request. Row Level Security still applies, so it can only ever read published
 * content: drafts and unpublished products are invisible to it.
 */
export function getPublicSupabase() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return null;

  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-softronics-context': 'public' } },
  });
}

/**
 * Service-role client. Bypasses Row Level Security, so it is only used for
 * operations that cannot run as the visitor:
 *   - inserting validated contact-form submissions
 *   - provisioning scripts
 * Never import this into a client component.
 */
export function getServiceSupabase() {
  const key = getServiceRoleKey();
  if (!publicEnv.supabaseUrl || !key) return null;

  return createClient(publicEnv.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
