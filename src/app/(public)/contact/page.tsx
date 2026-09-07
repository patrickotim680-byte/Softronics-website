import type { Metadata } from 'next';
import { Section } from '@/components/site/section';
import { ContactForm } from '@/components/site/contact-form';
import { INQUIRY_TYPES } from '@/lib/constants';
import { getSettings } from '@/lib/db/settings';
import { pageMetadata } from '@/lib/seo';
import type { InquiryType } from '@/types/database';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Talk to Softronics about a project, a product inquiry or a partnership. We reply to the address you provide.',
  path: '/contact',
});

function resolveInquiry(value: string | undefined): InquiryType {
  const match = INQUIRY_TYPES.find((entry) => entry.value === value);
  return match?.value ?? 'general';
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const [{ inquiry }, general] = await Promise.all([searchParams, getSettings('general')]);
  const whatsapp = general.whatsapp_number?.replace(/[^\d]/g, '') ?? '';

  return (
    <Section space="md">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[2.75rem]">
            Tell us what you are trying to solve.
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">
            The more concrete the problem, the more useful our first reply will be. Rough ideas are
            welcome too.
          </p>

          <div className="mt-10">
            <ContactForm defaultInquiry={resolveInquiry(inquiry)} />
          </div>
        </div>

        <aside className="space-y-8 lg:border-l lg:border-line lg:pl-10">
          <div>
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Direct
            </h2>
            <a
              href={`mailto:${general.contact_email}`}
              className="mt-3 block text-[1.0625rem] font-medium text-brand-strong underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
            >
              {general.contact_email}
            </a>
            {whatsapp.length > 0 && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[0.9375rem] text-ink underline decoration-line underline-offset-4 hover:decoration-ink/40"
              >
                WhatsApp
                <span aria-hidden="true">↗</span>
              </a>
            )}
            {general.location_label && (
              <p className="mt-4 text-sm text-muted">{general.location_label}</p>
            )}
          </div>

          <div>
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              What to expect
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              <li>A reply from a person, not an autoresponder.</li>
              <li>Questions about the problem before any proposal.</li>
              <li>An honest answer if it is not work we should take on.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Inquiry types
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              {INQUIRY_TYPES.map((type) => (
                <div key={type.value}>
                  <dt className="font-medium text-ink">{type.label}</dt>
                  <dd className="text-muted">{type.hint}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </Section>
  );
}
