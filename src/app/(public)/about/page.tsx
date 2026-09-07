import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { ProjectStatusBadge } from '@/components/site/status-badge';
import { PRINCIPLES } from '@/lib/constants';
import { getSettings } from '@/lib/db/settings';
import { listPublishedProjects } from '@/lib/db/projects';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: 'About',
  description:
    'Softronics is a technology company building practical, accessible and scalable software, starting from real-world problems.',
  path: '/about',
});

/** The company direction. Stated as intent, because that is what it is. */
const DIRECTION = [
  {
    stage: 'Now',
    title: 'Services',
    body: 'Custom software and systems built for organizations that have a specific problem to solve. This work funds everything else.',
  },
  {
    stage: 'Next',
    title: 'Software products',
    body: 'Problems we meet repeatedly become products, so the solution does not have to be rebuilt for each organization.',
  },
  {
    stage: 'Later',
    title: 'Platforms',
    body: 'Products that other people can build on, with shared accounts, data and integrations.',
  },
  {
    stage: 'Long term',
    title: 'Technology infrastructure',
    body: 'The layer other software depends on. A direction, not a claim about today.',
  },
] as const;

export default async function AboutPage() {
  const [about, cta, projects] = await Promise.all([
    getSettings('about'),
    getSettings('home_cta'),
    listPublishedProjects(),
  ]);

  return (
    <>
      <Section space="sm" className="border-b border-line">
        <div className="max-w-3xl">
          <p className="eyebrow">About Softronics</p>
          <h1 className="mt-5 text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink md:text-[3rem]">
            {about.philosophy_heading}
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted md:text-xl md:leading-[1.6]">
            {about.philosophy_body}
          </p>
        </div>
      </Section>

      <Section space="md">
        <SectionHeading
          eyebrow="Direction"
          title="Where the company is going, in order."
          lead="Written plainly so it is clear what exists today and what does not."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {DIRECTION.map((phase) => (
            <li key={phase.title} className="bg-surface p-7 md:p-8">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-brand">
                {phase.stage}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.018em] text-ink">
                {phase.title}
              </h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{phase.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section space="md" className="border-y border-line bg-surface">
        <SectionHeading eyebrow="Principles" title="What we hold to." />
        <dl className="mt-10 grid gap-x-14 gap-y-8 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="border-t border-line pt-5">
              <dt className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">
                {principle.title}
              </dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{principle.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {projects.length > 0 && (
        <Section space="md">
          <SectionHeading
            eyebrow="Work"
            title="Projects we can talk about."
            lead="Only work that is published here. Client engagements appear once we have permission to name them."
          />
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {projects.map((project) => (
              <li key={project.id} className="grid gap-4 py-7 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-10">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.015em] text-ink">
                    {project.name}
                  </h3>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <ProjectStatusBadge status={project.status} />
                    {project.year && (
                      <span className="font-mono text-[0.6875rem] text-faint">{project.year}</span>
                    )}
                    {project.sector && (
                      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                        {project.sector}
                      </span>
                    )}
                  </div>
                </div>
                <p className="max-w-prose text-[0.9375rem] leading-relaxed text-muted">
                  {project.summary}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section space="sm" className="border-t border-line">
        <div className="max-w-prose">
          <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">The team</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Softronics is a small team. Rather than publish invented biographies, this section will
            be filled in with real names and roles as the company formalises them. If you need to
            know who you would be working with, ask us directly and we will tell you.
          </p>
        </div>
      </Section>

      <CtaBand settings={cta} />
    </>
  );
}
