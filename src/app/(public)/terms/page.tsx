import type { Metadata } from 'next';
import { Section } from '@/components/site/section';
import { getSettings } from '@/lib/db/settings';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: 'Terms',
  description: 'Terms for using the Softronics website.',
  path: '/terms',
});

export default async function TermsPage() {
  const general = await getSettings('general');

  return (
    <Section space="md">
      <div className="max-w-prose">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-display-sm font-semibold tracking-[-0.028em] text-ink">Terms</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.1em] text-faint">
          Terms for this website. Project work is governed by its own signed agreement.
        </p>

        <div className="mt-10 space-y-8 text-[1.0625rem] leading-relaxed text-ink/85">
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Use of this site</h2>
            <p className="mt-3">
              You may read, link to and quote this website with attribution. You may not attempt to
              access non-public areas, disrupt the service, or submit content that is unlawful or
              deliberately harmful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">
              Accuracy of content
            </h2>
            <p className="mt-3">
              Product statuses on this site describe work in progress and may change. Nothing here
              is an offer, a warranty, or a commitment to deliver a specific feature or date. A
              proposal or signed agreement is the only binding description of work.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">
              Intellectual property
            </h2>
            <p className="mt-3">
              The Softronics name, logo and the written content of this site belong to Softronics.
              Ownership of work produced for a client is set out in that client&apos;s agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Contact</h2>
            <p className="mt-3">
              Questions about these terms:{' '}
              <a
                href={`mailto:${general.contact_email}`}
                className="font-medium text-brand-strong underline decoration-brand/30 underline-offset-4"
              >
                {general.contact_email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
