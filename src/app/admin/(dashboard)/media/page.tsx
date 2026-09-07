import Image from 'next/image';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/admin/page-header';
import { MediaUploader } from '@/components/admin/media-uploader';
import { DeleteAction } from '@/components/admin/row-actions';
import { deleteMediaAction } from '@/lib/actions/media';
import { listMedia } from '@/lib/db/media';
import { formatDate } from '@/lib/utils';
import { serverEnv, isSupabaseConfigured } from '@/lib/env';

export const metadata = { title: 'Media' };

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const media = await listMedia(120);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Media"
        description={`Images are stored in the Supabase Storage bucket "${serverEnv.storageBucket}". Files are never written into the repository.`}
      />

      {!configured && (
        <Alert tone="warning" title="Storage not connected">
          <p>
            Uploads need Supabase. Once the project is configured and the{' '}
            <code className="font-mono text-[0.8125rem]">{serverEnv.storageBucket}</code> bucket
            exists (migration 0002 creates it), uploads will work here.
          </p>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <MediaUploader />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Uploaded files get a public URL. Copy it into an article or product, or select it from
            the media dropdown in either editor.
          </p>
        </div>

        <div>
          {media.length === 0 ? (
            <EmptyState
              title="No media yet"
              description="Upload an image to use as an article featured image, a product logo or a cover image."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {media.map((item) => (
                <li key={item.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                  <div className="relative aspect-[4/3] bg-raised">
                    <Image
                      src={item.url}
                      alt={item.alt_text ?? ''}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="space-y-2 border-t border-line p-3">
                    <p className="truncate text-xs font-medium text-ink" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="font-mono text-[0.6875rem] text-faint">
                      {formatBytes(item.size_bytes)} · {formatDate(item.created_at)}
                    </p>
                    {item.alt_text && (
                      <p className="line-clamp-2 text-xs text-muted">{item.alt_text}</p>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-strong underline decoration-brand/30 underline-offset-4"
                      >
                        Open
                      </a>
                      <DeleteAction
                        action={deleteMediaAction}
                        id={item.id}
                        confirmMessage={`Delete ${item.filename}? Anything using this image will show a broken link.`}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
