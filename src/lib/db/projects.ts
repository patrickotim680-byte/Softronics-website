import 'server-only';

import { getPublicSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { Project } from '@/types/database';

export async function listPublishedProjects(): Promise<Project[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false });

  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data ?? []) as Project[];
}

export async function listAllProjects(): Promise<Project[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data ?? []) as Project[];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load project: ${error.message}`);
  return (data as Project) ?? null;
}

export async function countProjects(): Promise<{ total: number; published: number }> {
  const supabase = await getServerSupabase();
  if (!supabase) return { total: 0, published: 0 };

  const [total, published] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ]);

  return { total: total.count ?? 0, published: published.count ?? 0 };
}
