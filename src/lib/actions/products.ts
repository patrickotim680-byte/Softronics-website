'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { fieldErrors, productSchema } from '@/lib/validation/schemas';
import { parseFeatureList, slugify } from '@/lib/utils';
import { errorState, successState, type ActionState } from './types';
import { checkbox, integer, optional, text } from './form';
import type { ProductStatus } from '@/types/database';

function revalidateProduct(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/products');
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath('/sitemap.xml');
}

function readProductForm(formData: FormData) {
  const name = text(formData, 'name');
  const slugInput = text(formData, 'slug').trim();

  return {
    name,
    slug: slugInput.length > 0 ? slugify(slugInput) : slugify(name),
    short_description: optional(formData, 'short_description'),
    description: optional(formData, 'description'),
    logo_url: optional(formData, 'logo_url'),
    image_url: optional(formData, 'image_url'),
    category: optional(formData, 'category'),
    status: (text(formData, 'status') || 'concept') as ProductStatus,
    features: parseFeatureList(text(formData, 'features')),
    website_url: optional(formData, 'website_url'),
    cta_label: optional(formData, 'cta_label'),
    cta_url: optional(formData, 'cta_url'),
    is_featured: checkbox(formData, 'is_featured'),
    is_published: checkbox(formData, 'is_published'),
    sort_order: integer(formData, 'sort_order', 0),
    seo_title: optional(formData, 'seo_title'),
    seo_description: optional(formData, 'seo_description'),
  };
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin('/admin/products');
  const id = optional(formData, 'id');

  const parsed = productSchema.safeParse(readProductForm(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      errors: fieldErrors(parsed.error),
    };
  }

  const input = parsed.data;
  const supabase = await requireServerSupabase();
  let productId = id;
  let previousSlug: string | null = null;

  try {
    if (id) {
      const { data: existing } = await supabase
        .from('products')
        .select('slug')
        .eq('id', id)
        .maybeSingle();
      previousSlug = (existing as { slug: string } | null)?.slug ?? null;

      const { error } = await supabase.from('products').update(input).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase.from('products').insert(input).select('id').single();
      if (error) throw new Error(error.message);
      productId = (data as { id: string }).id;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('duplicate key') && message.includes('slug')) {
      return errorState('That slug is already used by another product.', {
        slug: 'This slug is already taken.',
      });
    }
    return errorState(`Could not save the product: ${message}`);
  }

  revalidateProduct(input.slug);
  if (previousSlug && previousSlug !== input.slug) revalidatePath(`/products/${previousSlug}`);
  revalidatePath('/admin/products');

  if (!id && productId) redirect(`/admin/products/${productId}?saved=1`);
  return successState(input.is_published ? 'Product saved and published.' : 'Product saved as unpublished.');
}

export async function toggleProductPublishedAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/products');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { data: existing } = await supabase
    .from('products')
    .select('slug, is_published')
    .eq('id', id)
    .maybeSingle();

  const current = existing as { slug: string; is_published: boolean } | null;
  if (!current) return;

  const { error } = await supabase
    .from('products')
    .update({ is_published: !current.is_published })
    .eq('id', id);
  if (error) throw new Error(`Could not update the product: ${error.message}`);

  revalidateProduct(current.slug);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
}

export async function setProductStatusAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/products');
  const id = optional(formData, 'id');
  const status = text(formData, 'status');
  const allowed = ['concept', 'research', 'in_development', 'coming_soon', 'available', 'archived'];
  if (!id || !allowed.includes(status)) return;

  const supabase = await requireServerSupabase();
  const { data: existing } = await supabase.from('products').select('slug').eq('id', id).maybeSingle();

  const { error } = await supabase.from('products').update({ status }).eq('id', id);
  if (error) throw new Error(`Could not update the status: ${error.message}`);

  revalidateProduct((existing as { slug: string } | null)?.slug);
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/products');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { data: existing } = await supabase.from('products').select('slug').eq('id', id).maybeSingle();

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Could not delete the product: ${error.message}`);

  revalidateProduct((existing as { slug: string } | null)?.slug);
  revalidatePath('/admin/products');
  redirect('/admin/products?deleted=1');
}
