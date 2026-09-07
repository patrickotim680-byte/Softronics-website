'use server';

import { revalidatePath } from 'next/cache';
import { requireOwner } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { allowlistSchema, fieldErrors } from '@/lib/validation/schemas';
import { errorState, successState, type ActionState } from './types';
import { optional, text } from './form';

/**
 * Team management works on the allowlist, not on credentials.
 *
 * Adding an email here permits that person to hold an admin account. The
 * account itself is created in Supabase Auth (dashboard invite or
 * `npm run admin:create`), where the password is set by the person directly.
 * This codebase never sees, stores or transmits a password.
 */
export async function addAllowlistEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOwner();

  const parsed = allowlistSchema.safeParse({
    email: text(formData, 'email'),
    role: text(formData, 'role') || 'admin',
    note: text(formData, 'note'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the fields below.',
      errors: fieldErrors(parsed.error),
    };
  }

  const supabase = await requireServerSupabase();
  const { error } = await supabase
    .from('admin_allowlist')
    .upsert(parsed.data, { onConflict: 'email' });

  if (error) return errorState(`Could not add the administrator: ${error.message}`);

  revalidatePath('/admin/team');
  return successState(
    `${parsed.data.email} is now authorized. Create their Supabase Auth account to finish setup.`,
  );
}

export async function removeAllowlistEntryAction(formData: FormData): Promise<void> {
  await requireOwner();
  const email = optional(formData, 'email');
  if (!email) return;

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('admin_allowlist').delete().eq('email', email);
  if (error) throw new Error(`Could not remove the entry: ${error.message}`);

  revalidatePath('/admin/team');
}

/** Deactivating revokes dashboard access immediately without deleting history. */
export async function setAdminActiveAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const id = optional(formData, 'id');
  const active = text(formData, 'active') === 'true';
  if (!id) return;

  // An owner cannot lock themselves out.
  if (id === session.userId && !active) return;

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('admin_users').update({ is_active: active }).eq('id', id);
  if (error) throw new Error(`Could not update the administrator: ${error.message}`);

  revalidatePath('/admin/team');
}
