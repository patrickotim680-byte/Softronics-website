import 'server-only';

import { serverEnv, publicEnv } from '@/lib/env';
import { getServerSupabase } from '@/lib/supabase/server';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/validation/schemas';

/**
 * Storage abstraction.
 *
 * The only implementation today is Supabase Storage, chosen because the project
 * already depends on Supabase for database and auth. Everything the application
 * needs is behind this interface, so adding S3/R2/Cloudinary later means adding
 * one file and switching the provider, with no changes to UI or actions.
 *
 * Binary files are never written to the repository or the local filesystem:
 * Vercel's runtime filesystem is ephemeral and read-only for app code.
 */
export interface StoredObject {
  bucket: string;
  path: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  upload(file: File, options?: { prefix?: string }): Promise<StoredObject>;
  remove(bucket: string, path: string): Promise<void>;
}

export class StorageError extends Error {}

function safeFilename(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.length > 0 ? cleaned.slice(-80) : 'file';
}

/** Server-side guard rails applied before any bytes are accepted. */
export function assertUploadable(file: File): void {
  if (!file || file.size === 0) throw new StorageError('Choose a file to upload.');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new StorageError(
      `File is larger than ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
    );
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new StorageError(`Unsupported file type: ${file.type || 'unknown'}.`);
  }
}

class SupabaseStorageProvider implements StorageProvider {
  readonly name = 'supabase';

  get isConfigured(): boolean {
    return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
  }

  async upload(file: File, options?: { prefix?: string }): Promise<StoredObject> {
    assertUploadable(file);

    const supabase = await getServerSupabase();
    if (!supabase) throw new StorageError('Storage is not configured.');

    const bucket = serverEnv.storageBucket;
    const now = new Date();
    const prefix = options?.prefix ?? `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const path = `${prefix}/${crypto.randomUUID()}-${safeFilename(file.name)}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });

    if (error) throw new StorageError(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      bucket,
      path,
      url: data.publicUrl,
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    };
  }

  async remove(bucket: string, path: string): Promise<void> {
    const supabase = await getServerSupabase();
    if (!supabase) throw new StorageError('Storage is not configured.');
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new StorageError(`Delete failed: ${error.message}`);
  }
}

export function getStorageProvider(): StorageProvider {
  return new SupabaseStorageProvider();
}
