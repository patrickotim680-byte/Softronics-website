import { Alert } from '@/components/ui/alert';

/**
 * Shown in development when Supabase is not configured. This is deliberately
 * honest: without a database there is no CMS content to display, and the app
 * says so rather than falling back to hard-coded placeholders.
 */
export function SetupNotice({ missing, context }: { missing: string[]; context: string }) {
  if (missing.length === 0) return null;

  return (
    <Alert tone="warning" title="Database not connected">
      <p>
        {context} is CMS-driven and needs Supabase. Missing environment{' '}
        {missing.length === 1 ? 'variable' : 'variables'}:{' '}
        <code className="font-mono text-[0.8125rem]">{missing.join(', ')}</code>. See{' '}
        <strong>Configure environment variables</strong> in the README.
      </p>
    </Alert>
  );
}
