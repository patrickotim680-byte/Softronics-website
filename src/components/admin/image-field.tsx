'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import type { MediaItem } from '@/types/database';

interface ImageFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  media: MediaItem[];
  hint?: string;
  error?: string;
}

/**
 * Image reference input: paste a URL, or pick something already in the media
 * library. Stores a URL string, which keeps posts and products independent of
 * any particular storage provider.
 */
export function ImageField({ label, name, defaultValue, media, hint, error }: ImageFieldProps) {
  const [value, setValue] = useState(defaultValue ?? '');

  return (
    <Field
      label={label}
      name={name}
      error={error}
      hint={hint ?? 'Paste an image URL, or choose from the media library.'}
    >
      <div className="space-y-2">
        <input
          {...fieldAria(name, name, error)}
          type="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://…"
          className={controlClass}
        />

        {media.length > 0 && (
          <select
            aria-label={`Choose ${label.toLowerCase()} from media library`}
            value=""
            onChange={(event) => {
              if (event.target.value) setValue(event.target.value);
            }}
            className={`${controlClass} text-sm`}
          >
            <option value="">Choose from media library…</option>
            {media.map((item) => (
              <option key={item.id} value={item.url}>
                {item.filename}
              </option>
            ))}
          </select>
        )}

        {value.length > 0 && (
          <div className="flex items-center gap-3 rounded-md border border-line bg-raised p-2">
            <Image
              src={value}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 rounded border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-muted">{value}</p>
              <button
                type="button"
                onClick={() => setValue('')}
                className="mt-1 text-xs font-medium text-signal-red hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}
