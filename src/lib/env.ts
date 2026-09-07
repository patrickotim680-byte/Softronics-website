/**
 * Single place where environment configuration is read.
 *
 * Rules enforced here:
 *   - only NEXT_PUBLIC_* values may be referenced from client components
 *   - the service role key is read through a function that throws if called in
 *     the browser bundle, so it cannot leak by accident
 *   - the app degrades to a documented "not configured" state instead of
 *     crashing when Supabase env vars are missing
 */

function optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export const publicEnv = {
  siteUrl: optional(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000',
  supabaseUrl: optional(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  contactEmail: optional(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ?? 'hello@softronics.example',
  whatsappNumber: optional(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
} as const;

/** True when the database/auth layer has enough configuration to be used. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

/** Server-only secret. Never import this from a client component. */
export function getServiceRoleKey(): string | null {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceRoleKey() must never be called in the browser.');
  }
  return optional(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const serverEnv = {
  storageBucket: optional(process.env.SUPABASE_STORAGE_BUCKET) ?? 'media',
  authSecret: () => optional(process.env.AUTH_SECRET),
  adminAllowedEmails: (): string[] =>
    (optional(process.env.ADMIN_ALLOWED_EMAILS) ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  email: {
    provider: () => optional(process.env.EMAIL_PROVIDER)?.toLowerCase() ?? null,
    resendApiKey: () => optional(process.env.RESEND_API_KEY),
    from: () => optional(process.env.EMAIL_FROM),
    to: () => optional(process.env.EMAIL_TO),
  },
} as const;

/** Human-readable list of missing configuration, used by the setup notices. */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!publicEnv.supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!publicEnv.supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return missing;
}
