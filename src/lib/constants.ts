import type { InquiryType, MessageStatus, PostStatus, ProductStatus, ProjectStatus } from '@/types/database';

export const SITE = {
  name: 'Softronics',
  tagline: 'Building practical software for Africa.',
  description:
    'Softronics designs and develops practical digital solutions for businesses, institutions and organizations, with a focus on solving real problems through technology.',
  locale: 'en_GB',
  twitter: undefined as string | undefined,
} as const;

export const MAIN_NAV = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/insights', label: 'Insights' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_NAV: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/insights', label: 'Insights' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Work',
    links: [
      { href: '/solutions', label: 'Solutions' },
      { href: '/products', label: 'Products' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export interface AdminNavItem {
  href: string;
  label: string;
  /** Match the path exactly instead of by prefix (used for /admin itself). */
  exact?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/posts', label: 'Insights' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/content', label: 'Site content' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/settings', label: 'Settings' },
];

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; tone: Tone }> = {
  concept: { label: 'Concept', tone: 'neutral' },
  research: { label: 'Research', tone: 'violet' },
  in_development: { label: 'In development', tone: 'amber' },
  coming_soon: { label: 'Coming soon', tone: 'blue' },
  available: { label: 'Available', tone: 'green' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  planned: { label: 'Planned', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'amber' },
  delivered: { label: 'Delivered', tone: 'green' },
  internal: { label: 'Internal', tone: 'blue' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const POST_STATUS: Record<PostStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'amber' },
  published: { label: 'Published', tone: 'green' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const MESSAGE_STATUS: Record<MessageStatus, { label: string; tone: Tone }> = {
  unread: { label: 'Unread', tone: 'blue' },
  read: { label: 'Read', tone: 'neutral' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const INQUIRY_TYPES: { value: InquiryType; label: string; hint: string }[] = [
  { value: 'general', label: 'General inquiry', hint: 'Questions about Softronics.' },
  { value: 'project', label: 'Project inquiry', hint: 'You have work you want built.' },
  { value: 'partnership', label: 'Partnership', hint: 'Collaboration or supplier discussion.' },
  { value: 'support', label: 'Support', hint: 'Help with something we built for you.' },
  { value: 'careers', label: 'Careers', hint: 'You want to work with us.' },
];

export type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'violet' | 'red';

/** Capability blocks on the homepage. Static company positioning, not CMS data. */
export const CAPABILITIES = [
  {
    index: '01',
    title: 'Software Development',
    summary: 'Web applications, business systems and custom digital platforms.',
    href: '/solutions#custom-software',
  },
  {
    index: '02',
    title: 'Product Development',
    summary: 'Turning recurring real-world problems into scalable software products.',
    href: '/solutions#digital-products',
  },
  {
    index: '03',
    title: 'AI & Automation',
    summary: 'Using modern AI and automation where they provide genuine practical value.',
    href: '/solutions#ai-automation',
  },
  {
    index: '04',
    title: 'Digital Solutions',
    summary: 'Technology designed around the realities and requirements of African organizations.',
    href: '/solutions#business-systems',
  },
] as const;

export const PRINCIPLES = [
  {
    title: 'Real problems first',
    body: 'We start from a problem someone already has, described in their words, before any technology is chosen.',
  },
  {
    title: 'Practical technology',
    body: 'Systems have to work on the devices and networks people actually use, not only on a developer laptop.',
  },
  {
    title: 'Quality engineering',
    body: 'Typed code, reviewed changes, tested paths. Software that can be maintained after it ships.',
  },
  {
    title: 'Security and responsible data handling',
    body: 'Least privilege by default, validation on the server, and no collection of data we do not need.',
  },
  {
    title: 'African context',
    body: 'Connectivity, cost, language, payments and infrastructure are design inputs, not afterthoughts.',
  },
  {
    title: 'Long-term thinking',
    body: 'Services fund products, products become platforms. We build foundations we can still extend later.',
  },
] as const;
