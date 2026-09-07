import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import type { MediaItem } from '@/types/database';

export async function listMedia(limit = 100): Promise<MediaItem[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load media: ${error.message}`);
  return (data ?? []) as MediaItem[];
}

export async function countMedia(): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase.from('media').select('id', { count: 'exact', head: true });
  return count ?? 0;
}
