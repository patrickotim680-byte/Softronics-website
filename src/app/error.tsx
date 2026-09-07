'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Application-level error boundary. The visitor gets a plain explanation; the
 * technical detail goes to the server log, never to the page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unhandled error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center">
      <div className="shell max-w-2xl py-20">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
          Something broke
        </p>
        <h1 className="mt-4 text-display-sm font-semibold tracking-[-0.025em] text-ink">
          This page could not be loaded.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The request failed before the page finished rendering. Trying again often works. If it
          keeps happening, the database connection is the first thing to check.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-faint">Reference: {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-md border border-line px-5 text-[0.9375rem] text-ink hover:bg-raised"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
