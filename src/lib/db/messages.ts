import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import type { ContactMessage, MessageStatus } from '@/types/database';

export async function listMessages(status?: MessageStatus): Promise<ContactMessage[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const base = supabase.from('contact_messages').select('*');
  const filtered = status ? base.eq('status', status) : base;

  const { data, error } = await filtered.order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load messages: ${error.message}`);
  return (data ?? []) as ContactMessage[];
}

export async function countUnreadMessages(): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return 0;

  const { count } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread');

  return count ?? 0;
}
