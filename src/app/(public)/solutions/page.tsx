import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { getSettings } from '@/lib/db/settings';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Solutions',
  description:
    'Custom software, web applications, business systems, AI and automation, and digital product development from Softronics.',
  path: '/solutions',
});

/**
 * Static company positioning. Each entry describes a class of problem rather
 * than claiming expertise, certifications or named clients we cannot evidence.
 */
const SOLUTIONS = [
  {
    id: 'custom-software',
    index: '01',
    title: 'Custom Software',
    lead: 'When the process is specific to your organization and off-the-shelf software forces you to work around it.',
    problems: [
      'A workflow that currently lives in spreadsheets passed between people',
      'Records kept in several places that no longer agree with each other',
      'Manual steps that have to be repeated because nothing connects',
      'Reporting that takes days to assemble by hand',
    ],
    delivers: 'A system built around your actual process, owned by you, documented and extensible.',
  },
  {
    id: 'web-applications',
    index: '02',
    title: 'Web Applications',
    lead: 'Systems your team and customers use through a browser, on whatever device they already own.',
    problems: [
      'Staff need access from different locations or on shared devices',
      'Customers need to submit, track or pay for something themselves',
      'An existing tool only works on one computer in one office',
      'A phone-first audience is being served a desktop-only interface',
    ],
    delivers:
      'Responsive, server-rendered applications with role-based access, designed to stay usable on slow connections.',
  },
  {
    id: 'business-systems',
    index: '03',
    title: 'Business Systems',
    lead: 'The operational backbone: records, inventory, billing, approvals and reporting.',
    problems: [
      'Stock levels are only known by asking someone',
      'Invoices and receipts are produced by hand and reconciled later',
      'No reliable audit trail of who changed what, and when',
      'Growth has outpaced the original way of working',
    ],
    delivers:
      'A relational data model that matches how the business actually runs, with permissions and history built in.',
  },
  {
    id: 'ai-automation',
    index: '04',
    title: 'AI & Automation',
    lead: 'Applied where it removes real work. Not added because it is fashionable.',
    problems: [
      'Documents are re-typed from one system into another',
      'The same routine question is answered dozens of times a week',
      'Unstructured text needs to be summarised, classified or extracted',
      'Repetitive checks are done manually and inconsistently',
    ],
    delivers:
      'Narrow, measurable automation with a human in the loop where accuracy matters, and clear limits on what data is sent where.',
  },
  {
    id: 'digital-products',
    index: '05',
    title: 'Digital Product Development',
    lead: 'For recurring problems that deserve a product rather than a one-off project.',
    problems: [
      'Several organizations describe the same problem in the same way',
      'An internal tool would be valuable to others in the sector',
      'An idea needs validation before serious investment',
      'A first version needs to reach real users quickly without becoming unmaintainable',
    ],
    delivers:
      'Problem research, a scoped first version, and an architecture that can carry the product past its first release.',
  },
] as const;

export default async function SolutionsPage() {
  const cta = await getSettings('home_cta');

  return (
    <>
      <Section space="sm" className="border-b border-line">
        <SectionHeading
          as="h1"
          eyebrow="Solutions"
          title="What Softronics can build with you."
          lead="Five areas of work, described by the problems they address. If your situation is not listed here, describe it to us anyway."
        />
      </Section>

      <div className="shell divide-y divide-line">
        {SOLUTIONS.map((solution) => (
          <section
            key={solution.id}
            id={solution.id}
            className="grid scroll-mt-24 gap-8 py-14 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16 md:py-20"
          >
            <div>
              <p className="font-mono text-[0.6875rem] tracking-[0.12em] text-brand">
                {solution.index}
              </p>
              <h2 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.022em] text-ink">
                {solution.title}
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{solution.lead}</p>
            </div>

            <div>
              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
                Problems this addresses
              </h3>
              <ul className="mt-4 space-y-3">
                {solution.problems.map((problem) => (
                  <li key={problem} className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink/85">
                    <span
                      aria-hidden="true"
                      className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70"
                    />
                    {problem}
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-line pt-5">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
                  What you get
                </h3>
                <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-muted">
                  {solution.delivers}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <Section space="sm" className="border-t border-line bg-surface">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-prose text-[1.0625rem] leading-relaxed text-muted">
            Engagements usually start with a short conversation about the problem, then a written
            scope before any code is written.
          </p>
          <Link
            href="/contact"
            className="shrink-0 text-[0.9375rem] font-medium text-brand-strong hover:text-brand"
          >
            Start that conversation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <CtaBand settings={cta} />
    </>
  );
}
