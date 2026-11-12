import Link from 'next/link';
import { FOOTER_NAV } from '@/lib/constants';
import { ContactLinks } from './contact-links';
import { LanguageSwitcher } from './language-switcher';
import { T } from './language-provider';
import { Logo } from './logo';
import type { GeneralSettings } from '@/lib/db/settings';

const NAV_IDS = new Set(['About', 'Insights', 'Contact', 'Solutions', 'Products']);

export function SiteFooter({
  settings,
  showInsights = true,
}: {
  settings: GeneralSettings;
  showInsights?: boolean;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-raised text-muted">
      <div className="shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div className="max-w-sm">
          <Logo size={30} />
          <p className="mt-4 text-[0.9375rem] leading-relaxed">{settings.tagline}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-faint">
                <T id="footer.email">Email</T>
              </dt>
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
                <dt className="text-faint">
                  <T id="footer.basedIn">Based in</T>
                </dt>
                <dd className="text-ink">{settings.location_label}</dd>
              </div>
            )}
          </dl>
          <ContactLinks
            layout="icons"
            className="mt-6"
            email={settings.contact_email}
            whatsapp={settings.whatsapp_number}
            socials
          />
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_NAV.map((group) => ({
            ...group,
            links: group.links.filter((link) => showInsights || link.href !== '/insights'),
          })).map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-xs font-semibold text-ink">
                <T id={`footer.${group.title.toLowerCase()}`}>{group.title}</T>
              </h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-300 hover:text-ink"
                    >
                      <T id={`${NAV_IDS.has(link.label) ? 'nav' : 'footer'}.${link.label.toLowerCase()}`}>
                        {link.label}
                      </T>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/[0.08]">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.company_name}. <T id="footer.rights">All rights reserved.</T>
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}
