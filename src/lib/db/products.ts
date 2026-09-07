import 'server-only';

import { getPublicSupabase, getServerSupabase } from '@/lib/supabase/server';
import type { Product } from '@/types/database';

/** Published products for the public site, featured first. */
export async function listPublishedProducts(): Promise<Product[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function listFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await listPublishedProducts();
  const featured = products.filter((product) => product.is_featured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return (data as Product) ?? null;
}

export async function listAllProducts(): Promise<Product[]> {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return (data as Product) ?? null;
}

export async function getProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_published', true);

  if (error) return [];
  return (data ?? []) as { slug: string; updated_at: string }[];
}

export async function countProducts(): Promise<{ total: number; published: number }> {
  const supabase = await getServerSupabase();
  if (!supabase) return { total: 0, published: 0 };

  const [total, published] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ]);

  return { total: total.count ?? 0, published: published.count ?? 0 };
}
