'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { optional, text } from './form';
import type { MessageStatus } from '@/types/database';

const ALLOWED: MessageStatus[] = ['unread', 'read', 'archived'];

export async function setMessageStatusAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/messages');
  const id = optional(formData, 'id');
  const status = text(formData, 'status') as MessageStatus;
  if (!id || !ALLOWED.includes(status)) return;

  const supabase = await requireServerSupabase();
  const { error } = await supabase
    .from('contact_messages')
    .update({ status, read_at: status === 'unread' ? null : new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Could not update the message: ${error.message}`);

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/messages');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(`Could not delete the message: ${error.message}`);

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}

export async function markAllMessagesReadAction(): Promise<void> {
  await requireAdmin('/admin/messages');
  const supabase = await requireServerSupabase();
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('status', 'unread');

  if (error) throw new Error(`Could not update messages: ${error.message}`);

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}
