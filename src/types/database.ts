/**
 * Hand-written row types for the Softronics schema (supabase/migrations).
 *
 * These mirror the SQL exactly. Once a Supabase project exists you can replace
 * this file with generated types:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 * The application only imports the named row types below, so the swap is local.
 */

export type AdminRole = 'owner' | 'admin' | 'editor';
export type PostStatus = 'draft' | 'published' | 'archived';
export type ProductStatus =
  | 'concept'
  | 'research'
  | 'in_development'
  | 'coming_soon'
  | 'available'
  | 'archived';
export type ProjectStatus = 'planned' | 'in_progress' | 'delivered' | 'internal' | 'archived';
export type MessageStatus = 'unread' | 'read' | 'archived';
export type InquiryType = 'general' | 'project' | 'partnership' | 'support' | 'careers';
export type CategoryKind = 'post' | 'product' | 'project';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAllowlistEntry {
  email: string;
  role: AdminRole;
  note: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface MediaItem {
  id: string;
  bucket: string;
  path: string;
  url: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_media_id: string | null;
  author_id: string | null;
  author_name: string | null;
  category_id: string | null;
  status: PostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  reading_minutes: number | null;
  created_at: string;
  updated_at: string;
}

/** A post joined with its category and tags, as returned by the db layer. */
export interface PostWithRelations extends Post {
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  image_url: string | null;
  category: string | null;
  status: ProductStatus;
  features: string[];
  website_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  sector: string | null;
  status: ProjectStatus;
  year: number | null;
  image_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  phone: string | null;
  inquiry_type: InquiryType;
  message: string;
  status: MessageStatus;
  source: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}
