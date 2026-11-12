import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { Reveal } from '@/components/site/reveal';
import { getSettings } from '@/lib/db/settings';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Solutions',
  description:
    'Custom software, business systems, and AI and automation from Softronics.',
  path: '/solutions',
});

/** Static company positioning. Each entry describes a class of problem we can help with. */
const SOLUTIONS = [
  {
    id: 'custom-software',
    index: '01',
    title: 'Custom Software',
    lead: 'When the process is specific to your organization and off-the-shelf software forces you to work around it.',
    problems: [
      'A workflow that lives in spreadsheets passed between people',
      'Customers need to submit, track or pay for something themselves',
      'A phone-first audience is being served a desktop-only interface',
    ],
    delivers:
      'A responsive web application built around your actual process, with role-based access, designed to stay usable on slow connections. Owned by you, documented and extensible.',
  },
  {
    id: 'business-systems',
    index: '02',
    title: 'Business Systems',
    lead: 'The operational backbone: records, inventory, billing, approvals and reporting.',
    problems: [
      'Stock levels are only known by asking someone',
      'Invoices and receipts are produced by hand and reconciled later',
      'No reliable record of who changed what, and when',
    ],
    delivers:
      'A data model that matches how the business actually runs, with permissions and history built in.',
  },
  {
    id: 'ai-automation',
    index: '03',
    title: 'AI & Automation',
    lead: 'Applied where it removes real work. Not added because it is fashionable.',
    problems: [
      'Documents are re-typed from one system into another',
      'The same routine question is answered dozens of times a week',
      'Unstructured text needs to be summarised, classified or extracted',
    ],
    delivers:
      'Narrow, measurable automation with a human in the loop where accuracy matters, and clear limits on what data is sent where.',
  },
] as const;

export default async function SolutionsPage() {
  const cta = await getSettings('home_cta');

  return (
    <>
      <Section space="lg">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Solutions"
          title="What Softronics can build with you."
          lead="Three areas of work, described by the problems they solve. If your situation is not listed, describe it to us anyway."
        />
      </Section>

      <div className="shell space-y-4 pb-20 md:pb-28">
        {SOLUTIONS.map((solution) => (
          <section key={solution.id} id={solution.id} className="scroll-mt-24">
            <Reveal>
              <div className="card card-soft grid gap-8 p-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16 md:p-12">
                <div>
                  <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.028em] text-ink md:text-[2rem]">
                    {solution.title}
                  </h2>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
                    {solution.lead}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">Problems this solves</h3>
                  <ul className="mt-4 space-y-3">
                    {solution.problems.map((problem) => (
                      <li
                        key={problem}
                        className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink/85"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70"
                        />
                        {problem}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 border-t border-ink/[0.08] pt-6">
                    <h3 className="text-sm font-semibold text-ink">What you get</h3>
                    <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
                      {solution.delivers}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        ))}

        <Reveal className="pt-10 text-center">
          <p className="mx-auto max-w-xl text-[1.0625rem] leading-relaxed text-muted">
            Every project starts with a short conversation about the problem, then a written scope
            before any code is written.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-1.5 text-[1.0625rem] font-medium text-brand-strong transition-colors duration-300 hover:text-brand"
          >
            Start that conversation <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>

      <CtaBand settings={cta} />
    </>
  );
}
