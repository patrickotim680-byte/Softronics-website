import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import type { AdminAllowlistEntry, AdminUser } from '@/types/database';

export async function listAdminUsers(): Promise<AdminUser[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to load administrators: ${error.message}`);
  return (data ?? []) as AdminUser[];
}

export async function listAllowlist(): Promise<AdminAllowlistEntry[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('admin_allowlist')
    .select('*')
    .order('email', { ascending: true });

  if (error) throw new Error(`Failed to load the allowlist: ${error.message}`);
  return (data ?? []) as AdminAllowlistEntry[];
}
