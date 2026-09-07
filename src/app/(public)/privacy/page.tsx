import type { Metadata } from 'next';
import { Section } from '@/components/site/section';
import { getSettings } from '@/lib/db/settings';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  description: 'What data the Softronics website collects, why, and how to have it removed.',
  path: '/privacy',
});

export default async function PrivacyPage() {
  const general = await getSettings('general');

  return (
    <Section space="md">
      <div className="max-w-prose">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-display-sm font-semibold tracking-[-0.028em] text-ink">
          Privacy
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.1em] text-faint">
          Plain-language summary. Not legal advice.
        </p>

        <div className="mt-10 space-y-8 text-[1.0625rem] leading-relaxed text-ink/85">
          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">
              What we collect
            </h2>
            <p className="mt-3">
              Only what you send us. If you submit the contact form we store the name,
              organization, email address, optional phone number, inquiry type and message you
              provided, along with the time of submission.
            </p>
            <p className="mt-3">
              For abuse prevention we also store a one-way hash of your IP address and a truncated
              browser user-agent string. The IP address itself is not stored.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Why we collect it</h2>
            <p className="mt-3">
              To reply to your inquiry, and to keep automated spam out of our inbox. We do not sell
              or share your details, and we do not use them for marketing you did not ask for.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Analytics and cookies</h2>
            <p className="mt-3">
              The public website sets no advertising or tracking cookies. A session cookie is used
              only inside the administrator dashboard, for signed-in staff.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Where it is stored</h2>
            <p className="mt-3">
              Submissions are stored in a managed PostgreSQL database with access restricted to
              authorized Softronics administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">
              Removing your data
            </h2>
            <p className="mt-3">
              Email{' '}
              <a
                href={`mailto:${general.contact_email}`}
                className="font-medium text-brand-strong underline decoration-brand/30 underline-offset-4"
              >
                {general.contact_email}
              </a>{' '}
              and ask us to delete your inquiry. We will confirm once it is done.
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
