import Link from 'next/link';
import { FOOTER_NAV } from '@/lib/constants';
import { Logo } from './logo';
import type { GeneralSettings } from '@/lib/db/settings';

export function SiteFooter({ settings }: { settings: GeneralSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-raised text-muted">
      <div className="shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div className="max-w-sm">
          <Logo size={30} />
          <p className="mt-4 text-[0.9375rem] leading-relaxed">{settings.tagline}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-faint">Email</dt>
              <dd>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-ink transition-colors duration-300 hover:text-brand-strong"
                >
                  {settings.contact_email}
                </a>
              </dd>
            </div>
            {settings.location_label && (
              <div className="flex gap-2">
                <dt className="text-faint">Based in</dt>
                <dd className="text-ink">{settings.location_label}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_NAV.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-xs font-semibold text-ink">{group.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-300 hover:text-ink"
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

      <div className="border-t border-ink/[0.08]">
        <div className="shell flex flex-col gap-2 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.company_name}. All rights reserved.
          </p>
          <p>Building practical software for Africa.</p>
        </div>
      </div>
    </footer>
  );
}
