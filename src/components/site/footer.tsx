import Link from 'next/link';
import { FOOTER_NAV } from '@/lib/constants';
import { Logo } from './logo';
import type { GeneralSettings } from '@/lib/db/settings';

export function SiteFooter({ settings }: { settings: GeneralSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-deep-line bg-deep text-deep-text">
      <div className="shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div className="max-w-sm">
          <Logo onDark size={32} />
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-deep-text/75">
            {settings.tagline}
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-deep-text/50">
                Email
              </dt>
              <dd>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-deep-text underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-brand-bright"
                >
                  {settings.contact_email}
                </a>
              </dd>
            </div>
            {settings.location_label && (
              <div className="flex gap-2">
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-deep-text/50">
                  Based in
                </dt>
                <dd className="text-deep-text/80">{settings.location_label}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_NAV.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-deep-text/50">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-deep-text/80 transition-colors duration-150 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-deep-line/70">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-deep-text/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.company_name}. All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-[0.1em]">
            Building practical software for Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
