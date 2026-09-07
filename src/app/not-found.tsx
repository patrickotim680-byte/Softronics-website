import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/site/logo';
import { MAIN_NAV } from '@/lib/constants';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="shell flex items-center py-6">
        <Logo />
      </div>
      <div className="shell flex flex-1 flex-col justify-center py-16">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
          Error 404
        </p>
        <h1 className="mt-4 max-w-2xl text-display-sm font-semibold tracking-[-0.025em] text-ink md:text-display-md">
          This page does not exist.
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted">
          The address may be mistyped, or the page may have been moved. These links still work.
        </p>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[0.9375rem] text-brand-strong underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <ButtonLink href="/">Back to homepage</ButtonLink>
        </div>
      </div>
    </main>
  );
}
