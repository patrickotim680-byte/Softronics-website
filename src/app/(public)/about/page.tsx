import type { Metadata } from 'next';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { Reveal } from '@/components/site/reveal';
import { ProjectStatusBadge } from '@/components/site/status-badge';
import { PRINCIPLES, SOCIAL_LINKS } from '@/lib/constants';
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

/** Where the company is heading, in order. */
const DIRECTION = [
  {
    stage: 'Now',
    title: 'Custom software',
    body: 'Software and systems built for organizations with a specific problem to solve. This work funds everything else.',
  },
  {
    stage: 'Next',
    title: 'Software products',
    body: 'Problems we meet again and again become products, so a solution does not have to be rebuilt for every organization.',
  },
  {
    stage: 'Later',
    title: 'Platforms',
    body: 'Products that other people can build on, with shared accounts, data and integrations.',
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
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(var(--brand)/0.08),transparent_72%)]"
        />
        <div className="shell relative flex flex-col items-center py-20 text-center md:py-32">
          <p className="eyebrow animate-fade-up">About Softronics</p>
          <h1
            className="animate-fade-up mt-4 max-w-[18ch] text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.035em] text-ink md:text-[4rem]"
            style={{ animationDelay: '100ms' }}
          >
            {about.philosophy_heading}
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg leading-[1.5] text-muted md:text-[1.375rem]"
            style={{ animationDelay: '220ms' }}
          >
            {about.philosophy_body}
          </p>
        </div>
      </section>

      <Section space="lg" className="bg-raised">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Direction"
            title="Where we are going."
            lead="Step by step, starting with the work we do today."
          />
        </Reveal>
        <ol className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {DIRECTION.map((phase, index) => (
            <li key={phase.title}>
              <Reveal delay={index * 120} className="h-full">
                <div className="card h-full p-8">
                  <p className="text-sm font-semibold text-brand-strong">{phase.stage}</p>
                  <h3 className="mt-3 text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-ink">
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{phase.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <Section space="lg">
        <Reveal>
          <SectionHeading align="center" eyebrow="Principles" title="What we hold to." />
        </Reveal>
        <dl className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 md:mt-20">
          {PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.title} delay={(index % 2) * 100}>
              <dt className="text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
                {principle.title}
              </dt>
              <dd className="mt-2 text-[1.0625rem] leading-relaxed text-muted">{principle.body}</dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      {projects.length > 0 && (
        <Section space="lg" className="bg-raised">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Work"
              title="Projects we can talk about."
              lead="Client work appears here once we have permission to name it."
            />
          </Reveal>
          <ul className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2">
            {projects.map((project, index) => (
              <li key={project.id}>
                <Reveal delay={(index % 2) * 120} className="h-full">
                  <div className="card h-full p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProjectStatusBadge status={project.status} />
                      {project.year && <span className="text-sm text-faint">{project.year}</span>}
                      {project.sector && (
                        <span className="text-sm text-faint">{project.sector}</span>
                      )}
                    </div>
                    <h3 className="mt-5 text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-ink">
                      {project.name}
                    </h3>
                    <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
                      {project.summary}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {SOCIAL_LINKS.length > 0 && (
        <Section space="sm">
          <Reveal className="text-center">
            <h2 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink md:text-[1.875rem]">
              Follow along.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[1.0625rem] leading-relaxed text-muted">
              We share what we are building, and what we are learning, as it happens.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center rounded-full bg-ink/[0.06] px-6 text-[0.9375rem] font-medium text-ink transition-[background-color,transform] duration-300 ease-out hover:bg-ink/[0.1] active:scale-[0.97]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </Reveal>
        </Section>
      )}

      <CtaBand settings={cta} />
    </>
  );
}
