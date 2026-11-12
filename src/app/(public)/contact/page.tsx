import type { Metadata } from 'next';
import { Section } from '@/components/site/section';
import { ContactLinks } from '@/components/site/contact-links';
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
          <p className="eyebrow animate-fade-up">Contact</p>
          <h1
            className="animate-fade-up mt-3 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink md:text-[3.5rem]"
            style={{ animationDelay: '100ms' }}
          >
            Tell us what you are trying to solve.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-prose text-lg leading-relaxed text-muted md:text-xl"
            style={{ animationDelay: '200ms' }}
          >
            The more concrete the problem, the more useful our first reply will be. Rough ideas are
            welcome too.
          </p>

          <div className="mt-10">
            <ContactForm defaultInquiry={resolveInquiry(inquiry)} />
          </div>
        </div>

        <aside className="space-y-6 lg:pt-3">
          <div className="card card-soft p-7">
            <h2 className="text-sm font-semibold text-ink">Reach us directly</h2>
            <ContactLinks
              layout="list"
              className="mt-3"
              email={general.contact_email}
              whatsapp={whatsapp}
              socials
            />
            {general.location_label && (
              <p className="mt-4 text-sm text-muted">{general.location_label}</p>
            )}
          </div>

          <div className="card card-soft p-7">
            <h2 className="text-sm font-semibold text-ink">What to expect</h2>
            <ul className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-muted">
              <li>A reply from a person, not an autoresponder.</li>
              <li>Questions about the problem before any proposal.</li>
              <li>An honest answer if it is not work we should take on.</li>
            </ul>
          </div>
        </aside>
      </div>
    </Section>
  );
}
