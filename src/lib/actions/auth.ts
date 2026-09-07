'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured, serverEnv } from '@/lib/env';
import { isSafeInternalPath } from '@/lib/utils';
import { errorState, type ActionState } from './types';
import { text } from './form';

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Password sign-in for the dashboard.
 *
 * Passwords are handled entirely by Supabase Auth (bcrypt/scrypt hashing, no
 * plaintext anywhere in this codebase and none in the repository). The error
 * message is intentionally generic so the form cannot be used to discover which
 * email addresses exist.
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

  const allowed = serverEnv.adminAllowedEmails();
  if (allowed.length > 0 && !allowed.includes(parsed.data.email)) {
    return errorState('Invalid email or password.');
  }

  const supabase = await getServerSupabase();
  if (!supabase) return errorState('Supabase is not configured yet.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return errorState('Invalid email or password.');
  }

  // Authenticated, but authorisation is a separate gate: the user must have an
  // active row in admin_users.
  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!admin || (admin as { is_active: boolean }).is_active !== true) {
    await supabase.auth.signOut();
    return errorState('This account is not authorized to use the Softronics dashboard.');
  }

  await supabase
    .from('admin_users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', data.user.id);

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
