'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin] error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold tracking-[-0.022em] text-ink">
        This dashboard page failed to load.
      </h1>
      <Alert tone="error" title="What usually causes this">
        <ul className="list-disc space-y-1 pl-4">
          <li>The database migrations have not been run yet.</li>
          <li>Row Level Security is blocking the query for this account.</li>
          <li>The Supabase project is paused or unreachable.</li>
        </ul>
      </Alert>
      {error.digest && <p className="font-mono text-xs text-faint">Reference: {error.digest}</p>}
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <a
          href="/admin"
          className="inline-flex h-11 items-center rounded-md border border-line px-5 text-[0.9375rem] text-ink hover:bg-raised"
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
