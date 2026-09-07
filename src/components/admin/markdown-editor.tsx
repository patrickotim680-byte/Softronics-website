'use client';

import { useState } from 'react';
import { Markdown } from '@/components/ui/markdown';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  rows?: number;
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Markdown editor with a live preview tab.
 *
 * Markdown is stored rather than HTML: it is safe to render (no raw HTML is
 * enabled), diff-friendly, and portable if the editor is ever replaced with a
 * richer one. The preview renders with exactly the component the public article
 * page uses, so what you see here is what publishes.
 */
export function MarkdownEditor({
  name,
  defaultValue = '',
  rows = 22,
  label,
  hint,
  error,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const words = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-ink">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.6875rem] text-faint">
            {words} words · ~{Math.max(1, Math.round(words / 200))} min
          </span>
          <div
            role="tablist"
            aria-label="Editor mode"
            className="flex rounded-md border border-line p-0.5"
          >
            {(['write', 'preview'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={tab === mode}
                onClick={() => setTab(mode)}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                  tab === mode ? 'bg-ink text-white' : 'text-muted hover:text-ink',
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The textarea is always mounted so its value posts with the form. */}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className={cn(
          'w-full rounded-md border border-line bg-surface px-3.5 py-3 font-mono text-[0.875rem] leading-relaxed text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25',
          tab === 'preview' && 'sr-only',
        )}
      />

      {tab === 'preview' && (
        <div className="rounded-md border border-line bg-surface p-5">
          {value.trim().length > 0 ? (
            <Markdown content={value} />
          ) : (
            <p className="text-sm text-faint">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {hint && (
        <p id={`${name}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-signal-red">
          {error}
        </p>
      )}
    </div>
  );
}
