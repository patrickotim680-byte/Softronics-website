'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { settingsSchema } from '@/lib/validation/schemas';
import { SETTINGS_DEFAULTS, type SettingsKey } from '@/lib/db/settings';
import { errorState, successState, type ActionState } from './types';
import { text } from './form';

/**
 * Saves one settings group. Only fields that exist in SETTINGS_DEFAULTS are
 * accepted, so the form cannot be used to write arbitrary JSON into the row.
 */
export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin('/admin/content');

  const key = text(formData, 'key') as SettingsKey;
  const defaults = SETTINGS_DEFAULTS[key];
  if (!defaults) return errorState('Unknown settings group.');

  const values: Record<string, string> = {};
  for (const field of Object.keys(defaults)) {
    values[field] = text(formData, field);
  }

  const parsed = settingsSchema.safeParse({ key, values });
  if (!parsed.success) return errorState('Some values are too long.');

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('site_settings').upsert(
    {
      key,
      value: parsed.data.values,
      updated_by: session.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );

  if (error) return errorState(`Could not save: ${error.message}`);

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content');

  return successState('Site content updated.');
}
