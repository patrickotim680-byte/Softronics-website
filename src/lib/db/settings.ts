import 'server-only';

import { cache } from 'react';
import { getPublicSupabase } from '@/lib/supabase/server';
import { SITE } from '@/lib/constants';
import { publicEnv } from '@/lib/env';
import type { SiteSetting } from '@/types/database';

export interface GeneralSettings {
  company_name: string;
  tagline: string;
  contact_email: string;
  whatsapp_number: string;
  location_label: string;
}

export interface HeroSettings {
  heading: string;
  description: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
}

export interface CtaSettings {
  heading: string;
  subheading: string;
  cta_label: string;
  cta_href: string;
}

export interface AboutSettings {
  philosophy_heading: string;
  philosophy_body: string;
}

/** Defaults are the source of truth until an admin overrides them in the CMS. */
export const SETTINGS_DEFAULTS = {
  general: {
    company_name: SITE.name,
    tagline: SITE.tagline,
    contact_email: publicEnv.contactEmail,
    whatsapp_number: publicEnv.whatsappNumber ?? '',
    location_label: 'East Africa',
  } satisfies GeneralSettings,
  home_hero: {
    heading: 'Building practical software for Africa.',
    description: SITE.description,
    primary_cta_label: 'Talk to Softronics',
    primary_cta_href: '/contact',
    secondary_cta_label: 'Explore Our Work',
    secondary_cta_href: '/products',
  } satisfies HeroSettings,
  home_cta: {
    heading: 'Have a problem technology could solve?',
    subheading: "Let's build something useful.",
    cta_label: 'Talk to Softronics',
    cta_href: '/contact',
  } satisfies CtaSettings,
  about: {
    philosophy_heading: 'Technology should solve real problems.',
    philosophy_body:
      'Softronics exists to build practical, accessible and scalable software, starting from real-world problems and growing toward products that can serve African markets and eventually global users.',
  } satisfies AboutSettings,
};

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;

/**
 * Per-request memoised read. React `cache` is used rather than `unstable_cache`
 * because this query runs through the cookie-bound Supabase client.
 */
const fetchSettingsRows = cache(async (): Promise<SiteSetting[]> => {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('[settings] read failed:', error.message);
    return [];
  }
  return (data ?? []) as SiteSetting[];
});

/**
 * Reads a settings group, merged over the built-in defaults so a missing or
 * partially filled row can never blank out the website.
 */
export async function getSettings<K extends SettingsKey>(
  key: K,
): Promise<(typeof SETTINGS_DEFAULTS)[K]> {
  const rows = await fetchSettingsRows();
  const row = rows.find((entry) => entry.key === key);
  const defaults = SETTINGS_DEFAULTS[key];
  if (!row) return defaults;

  const merged: Record<string, unknown> = { ...defaults };
  for (const [field, value] of Object.entries(row.value ?? {})) {
    if (typeof value === 'string' && value.trim().length === 0) continue;
    if (value === null || value === undefined) continue;
    if (field in merged) merged[field] = value;
  }
  return merged as (typeof SETTINGS_DEFAULTS)[K];
}

export async function getAllSettings(): Promise<Record<string, Record<string, unknown>>> {
  const rows = await fetchSettingsRows();
  return Object.fromEntries(rows.map((row) => [row.key, row.value ?? {}]));
}

/** Convenience accessor used by the header and footer. */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  return getSettings('general');
}
