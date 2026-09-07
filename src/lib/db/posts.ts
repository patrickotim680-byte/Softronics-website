import 'server-only';

import { getPublicSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { Post, PostStatus, PostWithRelations, Tag } from '@/types/database';

const POST_SELECT = `
  id, title, slug, excerpt, content, featured_image_url, featured_media_id,
  author_id, author_name, category_id, status, published_at, seo_title,
  seo_description, reading_minutes, created_at, updated_at,
  category:categories ( id, name, slug ),
  post_tags ( tags ( id, name, slug ) )
`;

type RawPost = Post & {
  category: { id: string; name: string; slug: string } | null;
  post_tags: { tags: Pick<Tag, 'id' | 'name' | 'slug'> | null }[] | null;
};

function shape(row: RawPost): PostWithRelations {
  const { post_tags, ...rest } = row;
  return {
    ...rest,
    tags: (post_tags ?? [])
      .map((entry) => entry.tags)
      .filter((tag): tag is Pick<Tag, 'id' | 'name' | 'slug'> => Boolean(tag)),
  };
}

/** Published articles for the public site. Drafts are excluded by RLS as well. */
export async function listPublishedPosts(limit?: number): Promise<PostWithRelations[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[posts] public read failed:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as RawPost[]).map(shape);
}

export async function getPublishedPostBySlug(slug: string): Promise<PostWithRelations | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error('[posts] public read failed:', error.message);
    return null;
  }
  return data ? shape(data as unknown as RawPost) : null;
}

/** Every article, any status. Only reachable by admins (RLS + requireAdmin). */
export async function listAllPosts(status?: PostStatus): Promise<PostWithRelations[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  // Filters must be applied before .order(): the transform builder has no .eq().
  const base = supabase.from('posts').select(POST_SELECT);
  const filtered = status ? base.eq('status', status) : base;

  const { data, error } = await filtered.order('updated_at', { ascending: false });
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return ((data ?? []) as unknown as RawPost[]).map(shape);
}

export async function getPostById(id: string): Promise<PostWithRelations | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load article: ${error.message}`);
  return data ? shape(data as unknown as RawPost) : null;
}

export async function getPostSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString());

  if (error) return [];
  return (data ?? []) as { slug: string; updated_at: string }[];
}

export async function countPosts(): Promise<{ total: number; published: number; drafts: number }> {
  const supabase = await getServerSupabase();
  if (!supabase) return { total: 0, published: 0, drafts: 0 };

  const [total, published, drafts] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);

  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    drafts: drafts.count ?? 0,
  };
}
