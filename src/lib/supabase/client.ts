'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/env';

/**
 * Browser Supabase client. Uses the anon key only, which is safe to expose:
 * Row Level Security decides what it can read or write.
 */
export function createSupabaseBrowserClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
    );
  }
  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}
