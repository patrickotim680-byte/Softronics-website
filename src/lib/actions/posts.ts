'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { postSchema, fieldErrors } from '@/lib/validation/schemas';
import { estimateReadingMinutes, parseTagList, plainText, slugify, truncate } from '@/lib/utils';
import { errorState, successState, type ActionState } from './types';
import { optional, text, uuidOrNull } from './form';
import type { PostStatus } from '@/types/database';

type SupabaseServerClient = Awaited<ReturnType<typeof requireServerSupabase>>;

function revalidatePublicPost(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/insights');
  if (slug) revalidatePath(`/insights/${slug}`);
  revalidatePath('/sitemap.xml');
}

/** Creates missing tags, then replaces the article's tag set. */
async function syncTags(supabase: SupabaseServerClient, postId: string, names: string[]) {
  await supabase.from('post_tags').delete().eq('post_id', postId);
  if (names.length === 0) return;

  const rows = names.map((name) => ({ name, slug: slugify(name) })).filter((row) => row.slug);
  if (rows.length === 0) return;

  const { error: upsertError } = await supabase
    .from('tags')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });
  if (upsertError) throw new Error(upsertError.message);

  const { data: tags, error: selectError } = await supabase
    .from('tags')
    .select('id, slug')
    .in(
      'slug',
      rows.map((row) => row.slug),
    );
  if (selectError) throw new Error(selectError.message);

  const links = ((tags ?? []) as { id: string }[]).map((tag) => ({ post_id: postId, tag_id: tag.id }));
  if (links.length > 0) {
    const { error } = await supabase.from('post_tags').insert(links);
    if (error) throw new Error(error.message);
  }
}

function readPostForm(formData: FormData) {
  const title = text(formData, 'title');
  const slugInput = text(formData, 'slug').trim();
  const status = (text(formData, 'status') || 'draft') as PostStatus;
  const publishedAtInput = text(formData, 'published_at').trim();

  return {
    title,
    slug: slugInput.length > 0 ? slugify(slugInput) : slugify(title),
    excerpt: optional(formData, 'excerpt'),
    content: text(formData, 'content'),
    featured_image_url: optional(formData, 'featured_image_url'),
    category_id: uuidOrNull(formData, 'category_id'),
    status,
    // Publishing without an explicit date uses "now", so the article appears
    // immediately on the public site.
    published_at:
      publishedAtInput.length > 0
        ? publishedAtInput
        : status === 'published'
          ? new Date().toISOString()
          : null,
    seo_title: optional(formData, 'seo_title'),
    seo_description: optional(formData, 'seo_description'),
    author_name: optional(formData, 'author_name'),
    tags: parseTagList(text(formData, 'tags')),
  };
}

export async function savePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin('/admin/posts');
  const id = optional(formData, 'id');

  const parsed = postSchema.safeParse(readPostForm(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', errors: fieldErrors(parsed.error) };
  }

  const input = parsed.data;
  const supabase = await requireServerSupabase();

  const record = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? (input.content ? truncate(plainText(input.content), 200) : null),
    content: input.content,
    featured_image_url: input.featured_image_url,
    category_id: input.category_id ?? null,
    status: input.status,
    published_at: input.published_at,
    seo_title: input.seo_title,
    seo_description: input.seo_description ?? (input.excerpt ? truncate(input.excerpt, 300) : null),
    author_name: input.author_name ?? session.admin.full_name ?? 'Softronics',
    author_id: session.userId,
    reading_minutes: estimateReadingMinutes(input.content),
  };

  let postId = id;
  let previousSlug: string | null = null;

  try {
    if (id) {
      const { data: existing } = await supabase.from('posts').select('slug').eq('id', id).maybeSingle();
      previousSlug = (existing as { slug: string } | null)?.slug ?? null;

      const { error } = await supabase.from('posts').update(record).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase.from('posts').insert(record).select('id').single();
      if (error) throw new Error(error.message);
      postId = (data as { id: string }).id;
    }

    if (postId) await syncTags(supabase, postId, input.tags);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('duplicate key') && message.includes('slug')) {
      return errorState('That slug is already used by another article.', {
        slug: 'This slug is already taken.',
      });
    }
    return errorState(`Could not save the article: ${message}`);
  }

  revalidatePublicPost(input.slug);
  if (previousSlug && previousSlug !== input.slug) revalidatePath(`/insights/${previousSlug}`);
  revalidatePath('/admin/posts');
  if (postId) revalidatePath(`/admin/posts/${postId}`);

  if (!id && postId) redirect(`/admin/posts/${postId}?saved=1`);
  return successState(input.status === 'published' ? 'Article published.' : 'Article saved.');
}

export async function setPostStatusAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/posts');
  const id = optional(formData, 'id');
  const status = text(formData, 'status') as PostStatus;
  if (!id || !['draft', 'published', 'archived'].includes(status)) return;

  const supabase = await requireServerSupabase();
  const { data: existing } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('id', id)
    .maybeSingle();

  const current = existing as { slug: string; published_at: string | null } | null;

  const patch: Record<string, unknown> = { status };
  if (status === 'published' && !current?.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from('posts').update(patch).eq('id', id);
  if (error) throw new Error(`Could not update the article: ${error.message}`);

  revalidatePublicPost(current?.slug);
  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/${id}`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/posts');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { data: existing } = await supabase.from('posts').select('slug').eq('id', id).maybeSingle();

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw new Error(`Could not delete the article: ${error.message}`);

  revalidatePublicPost((existing as { slug: string } | null)?.slug);
  revalidatePath('/admin/posts');
  redirect('/admin/posts?deleted=1');
}
