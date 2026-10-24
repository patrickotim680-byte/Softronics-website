import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { ProductLine } from '@/components/site/product-row';
import { Reveal } from '@/components/site/reveal';
import { SetupNotice } from '@/components/site/setup-notice';
import { CAPABILITIES, PRINCIPLES, SITE } from '@/lib/constants';
import { getSettings } from '@/lib/db/settings';
import { listFeaturedProducts } from '@/lib/db/products';
import { listPublishedPosts } from '@/lib/db/posts';
import { missingSupabaseEnv } from '@/lib/env';
import { formatDate } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name}: ${SITE.tagline}`,
  description: SITE.description,
  path: '/',
});

export default async function HomePage() {
  const [hero, cta, products, posts] = await Promise.all([
    getSettings('home_hero'),
    getSettings('home_cta'),
    listFeaturedProducts(4),
    listPublishedPosts(2),
  ]);

  const missing = missingSupabaseEnv();

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(var(--brand)/0.1),transparent_72%)]"
        />
        <div className="shell relative flex flex-col items-center pb-20 pt-14 text-center md:pb-32 md:pt-24">
          <p className="eyebrow animate-fade-up">Softronics</p>
          <h1
            className="animate-fade-up mt-4 max-w-[16ch] text-[2.875rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[4.25rem] lg:text-display-lg"
            style={{ animationDelay: '100ms' }}
          >
            {hero.heading}
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg leading-[1.5] text-muted md:text-[1.375rem]"
            style={{ animationDelay: '220ms' }}
          >
            {hero.description}
          </p>
          <div
            className="animate-fade-up mt-9 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: '340ms' }}
          >
            <ButtonLink href={hero.primary_cta_href} size="lg">
              {hero.primary_cta_label}
            </ButtonLink>
            <ButtonLink href={hero.secondary_cta_href} variant="secondary" size="lg">
              {hero.secondary_cta_label}
            </ButtonLink>
          </div>

          <div
            className="animate-scale-in relative mt-16 md:mt-24"
            style={{ animationDelay: '480ms' }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand/20 blur-3xl"
            />
            <div className="animate-float">
              <Image
                src="/brand/softronics-mark.png"
                alt="Softronics"
                width={300}
                height={300}
                priority
                className="relative h-48 w-48 md:h-72 md:w-72"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ What we do */}
      <Section id="what-we-do" space="lg" className="bg-raised">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="What we do"
            title="Four ways we work with organizations."
            lead="Every engagement starts with the problem, in the words of the people who have it."
          />
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20">
          {CAPABILITIES.map((capability, index) => (
            <li key={capability.index}>
              <Reveal delay={(index % 2) * 120} className="h-full">
                <Link
                  href={capability.href}
                  className="card card-lift group flex h-full min-h-[15rem] flex-col p-8 md:p-10"
                >
                  <h3 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[1.75rem]">
                    {capability.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[1.0625rem] leading-relaxed text-muted">
                    {capability.summary}
                  </p>
                  <span className="mt-auto pt-8">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-raised text-ink transition-[background-color,color,transform] duration-500 ease-out group-hover:translate-x-1 group-hover:bg-brand group-hover:text-white"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-10 text-center">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 text-[1.0625rem] font-medium text-brand-strong transition-colors duration-300 hover:text-brand"
          >
            See all solutions <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </Section>

      {/* ------------------------------------------------- What we're making */}
      <Section id="building" space="lg">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Products"
            title="What we're making."
            lead="Software built for African organizations and the people who rely on it."
          />
        </Reveal>

        <div className="mt-14 md:mt-20">
          {missing.length > 0 && (
            <div className="mb-6">
              <SetupNotice missing={missing} context="This section" />
            </div>
          )}

          {products.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {products.map((product, index) => (
                <li key={product.id}>
                  <Reveal delay={(index % 2) * 120} className="h-full">
                    <ProductLine product={product} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No products published yet"
              description="Products are managed in the admin dashboard. Once one is created and published it appears here automatically."
              action={
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Talk to Softronics
                </ButtonLink>
              }
            />
          )}
        </div>

        <Reveal className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-[1.0625rem] font-medium text-brand-strong transition-colors duration-300 hover:text-brand"
          >
            See all products <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </Section>

      {/* --------------------------------------------------------------- Why us */}
      <Section id="why" space="lg" className="bg-raised">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Why Softronics"
            title="How we decide what to build, and how to build it."
          />
        </Reveal>
        <dl className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.title} delay={(index % 3) * 100}>
              <dt className="text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
                {principle.title}
              </dt>
              <dd className="mt-2 text-[1.0625rem] leading-relaxed text-muted">
                {principle.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      {/* -------------------------------------------------------------- Insights */}
      {posts.length > 0 && (
        <Section space="md">
          <Reveal className="flex items-end justify-between gap-6">
            <h2 className="text-[1.75rem] font-semibold tracking-[-0.025em] text-ink md:text-[2.25rem]">
              Recent writing
            </h2>
            <Link
              href="/insights"
              className="shrink-0 text-[1.0625rem] font-medium text-brand-strong transition-colors duration-300 hover:text-brand"
            >
              All insights <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {posts.map((post, index) => (
              <li key={post.id}>
                <Reveal delay={index * 120} className="h-full">
                  <Link
                    href={`/insights/${post.slug}`}
                    className="card card-soft card-lift group flex h-full flex-col p-8"
                  >
                    <time
                      dateTime={post.published_at ?? undefined}
                      className="text-sm text-faint"
                    >
                      {formatDate(post.published_at)}
                    </time>
                    <h3 className="mt-3 text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-ink">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand settings={cta} />
    </>
  );
}
