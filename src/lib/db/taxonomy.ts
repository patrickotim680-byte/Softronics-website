import 'server-only';

import { getServerSupabase } from '@/lib/supabase/server';
import type { Category, CategoryKind, Tag } from '@/types/database';

export async function listCategories(kind?: CategoryKind): Promise<Category[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const base = supabase.from('categories').select('*');
  const filtered = kind ? base.eq('kind', kind) : base;

  const { data, error } = await filtered.order('name', { ascending: true });
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return (data ?? []) as Category[];
}

export async function listTags(): Promise<Tag[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true });
  if (error) throw new Error(`Failed to load tags: ${error.message}`);
  return (data ?? []) as Tag[];
}
