import { z } from 'zod';

/**
 * All input crossing a trust boundary is validated here and nowhere else.
 * Server Actions parse with these schemas before touching the database, so
 * client-side validation is a convenience, never the gate.
 */

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .catch(null);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(2, 'Slug is too short')
  .max(80, 'Slug is too long')
  .regex(slugPattern, 'Use lowercase letters, numbers and single hyphens');

export const urlOrPathSchema = optionalText(500).refine(
  (value) =>
    value === null ||
    value.startsWith('/') ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value),
  { message: 'Use a full https:// URL, a mailto: link, or a path starting with /' },
);

/* -------------------------------------------------------------------------- */
/* Contact                                                                     */
/* -------------------------------------------------------------------------- */

export const INQUIRY_VALUES = ['general', 'project', 'partnership', 'support', 'careers'] as const;

export const contactSchema = z.object({
  name: trimmed(120).min(2, 'Please enter your name'),
  organization: optionalText(160),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  phone: optionalText(40).refine(
    (value) => value === null || /^[+()\d\s-]{6,40}$/.test(value),
    { message: 'Enter a valid phone number' },
  ),
  inquiry_type: z.enum(INQUIRY_VALUES).default('general'),
  message: trimmed(4000).min(20, 'Please describe your inquiry in at least 20 characters'),
  // Honeypot: real users never fill this. Bots usually do.
  company_website: z.string().max(0, 'Rejected').optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* -------------------------------------------------------------------------- */
/* Posts                                                                       */
/* -------------------------------------------------------------------------- */

export const postSchema = z.object({
  title: trimmed(200).min(3, 'Title is required'),
  slug: slugSchema,
  excerpt: optionalText(400),
  content: z.string().trim().max(120_000).default(''),
  featured_image_url: urlOrPathSchema,
  category_id: z
    .string()
    .uuid()
    .nullable()
    .catch(null)
    .or(z.literal('').transform(() => null)),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z
    .string()
    .trim()
    .nullable()
    .catch(null)
    .transform((value) => (value && value.length > 0 ? new Date(value).toISOString() : null)),
  seo_title: optionalText(200),
  seo_description: optionalText(320),
  author_name: optionalText(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
});

export type PostInput = z.infer<typeof postSchema>;

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export const PRODUCT_STATUS_VALUES = [
  'concept',
  'research',
  'in_development',
  'coming_soon',
  'available',
  'archived',
] as const;

export const productSchema = z.object({
  name: trimmed(160).min(2, 'Name is required'),
  slug: slugSchema,
  short_description: optionalText(320),
  description: optionalText(20_000),
  logo_url: urlOrPathSchema,
  image_url: urlOrPathSchema,
  category: optionalText(80),
  status: z.enum(PRODUCT_STATUS_VALUES).default('concept'),
  features: z.array(z.string().trim().min(1).max(200)).max(24).default([]),
  website_url: urlOrPathSchema,
  cta_label: optionalText(80),
  cta_url: urlOrPathSchema,
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
  seo_title: optionalText(200),
  seo_description: optionalText(320),
});

export type ProductInput = z.infer<typeof productSchema>;

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export const PROJECT_STATUS_VALUES = [
  'planned',
  'in_progress',
  'delivered',
  'internal',
  'archived',
] as const;

export const projectSchema = z.object({
  name: trimmed(160).min(2, 'Name is required'),
  slug: slugSchema,
  summary: optionalText(400),
  description: optionalText(20_000),
  sector: optionalText(80),
  status: z.enum(PROJECT_STATUS_VALUES).default('in_progress'),
  year: z.number().int().min(2000).max(2100).nullable().catch(null),
  image_url: urlOrPathSchema,
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/gif',
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const mediaMetaSchema = z.object({
  alt_text: optionalText(300),
});

/* -------------------------------------------------------------------------- */
/* Team / admins                                                               */
/* -------------------------------------------------------------------------- */

export const allowlistSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  role: z.enum(['owner', 'admin', 'editor']).default('admin'),
  note: optionalText(200),
});

/* -------------------------------------------------------------------------- */
/* Site settings                                                               */
/* -------------------------------------------------------------------------- */

export const settingsSchema = z.object({
  key: z.enum(['general', 'home_hero', 'home_cta', 'about']),
  values: z.record(z.string().trim().max(4000)),
});

/** Flattens Zod issues into a field -> message map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
