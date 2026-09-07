'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { requireServerSupabase } from '@/lib/supabase/server';
import { getStorageProvider, StorageError } from '@/lib/storage';
import { mediaMetaSchema } from '@/lib/validation/schemas';
import { errorState, successState, type ActionState } from './types';
import { optional, text } from './form';

/**
 * Uploads a file to the configured storage provider and records its metadata.
 * The file itself never touches the repository or the server filesystem.
 */
export async function uploadMediaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin('/admin/media');

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return errorState('Choose an image to upload.', { file: 'No file selected.' });
  }

  const meta = mediaMetaSchema.safeParse({ alt_text: text(formData, 'alt_text') });
  if (!meta.success) {
    return errorState('Alt text is too long.', { alt_text: 'Keep alt text under 300 characters.' });
  }

  try {
    const stored = await getStorageProvider().upload(file);
    const supabase = await requireServerSupabase();

    const { error } = await supabase.from('media').insert({
      bucket: stored.bucket,
      path: stored.path,
      url: stored.url,
      filename: stored.filename,
      mime_type: stored.mimeType,
      size_bytes: stored.sizeBytes,
      alt_text: meta.data.alt_text,
      uploaded_by: session.userId,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    if (error instanceof StorageError) return errorState(error.message, { file: error.message });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorState(`Upload failed: ${message}`);
  }

  revalidatePath('/admin/media');
  return successState('Image uploaded.');
}

export async function updateMediaAltAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin('/admin/media');
  const id = optional(formData, 'id');
  if (!id) return errorState('Missing media id.');

  const meta = mediaMetaSchema.safeParse({ alt_text: text(formData, 'alt_text') });
  if (!meta.success) return errorState('Alt text is too long.');

  const supabase = await requireServerSupabase();
  const { error } = await supabase.from('media').update({ alt_text: meta.data.alt_text }).eq('id', id);
  if (error) return errorState(`Could not update: ${error.message}`);

  revalidatePath('/admin/media');
  return successState('Alt text updated.');
}

/** Removes the stored object first, then the row, so no orphaned files remain. */
export async function deleteMediaAction(formData: FormData): Promise<void> {
  await requireAdmin('/admin/media');
  const id = optional(formData, 'id');
  if (!id) return;

  const supabase = await requireServerSupabase();
  const { data } = await supabase.from('media').select('bucket, path').eq('id', id).maybeSingle();
  const row = data as { bucket: string; path: string } | null;

  if (row) {
    try {
      await getStorageProvider().remove(row.bucket, row.path);
    } catch (error) {
      // The row is still removed: a missing object must not block cleanup.
      console.error('[media] storage delete failed:', error);
    }
  }

  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw new Error(`Could not delete the media item: ${error.message}`);

  revalidatePath('/admin/media');
}
