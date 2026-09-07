import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/admin/login-form';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/site/logo';
import { isSafeInternalPath } from '@/lib/utils';
import { missingSupabaseEnv } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && isSafeInternalPath(next) ? next : undefined;
  const missing = missingSupabaseEnv();

  return (
    <main className="flex min-h-screen flex-col bg-canvas">
      <div className="shell flex h-16 items-center">
        <Logo />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-[24rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
            Softronics CMS
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.022em] text-ink">
            Administrator sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Authorized accounts only. Access is granted per email address.
          </p>

          <div className="mt-8">
            {missing.length > 0 ? (
              <Alert tone="warning" title="Setup required">
                <p>
                  Authentication needs Supabase. Missing:{' '}
                  <code className="font-mono text-[0.8125rem]">{missing.join(', ')}</code>.
                </p>
                <p className="mt-2">
                  Copy <code className="font-mono text-[0.8125rem]">.env.example</code> to{' '}
                  <code className="font-mono text-[0.8125rem]">.env.local</code>, fill in your
                  Supabase keys, run the migrations, then restart the dev server. The README has the
                  full sequence.
                </p>
              </Alert>
            ) : (
              <LoginForm next={safeNext} />
            )}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs leading-relaxed text-muted">
              Passwords are managed by Supabase Auth and are never stored in this application.
              Forgotten password: reset it from the Supabase dashboard, or ask another owner to send
              a reset link.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
