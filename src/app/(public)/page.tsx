import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { NetworkField } from '@/components/site/network-field';
import { ProductLine } from '@/components/site/product-row';
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
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="grid-field absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
          aria-hidden="true"
        />
        <div className="shell relative grid gap-12 pb-16 pt-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pb-24 md:pt-20">
          <div className="animate-fade-up">
            <p className="eyebrow">Softronics</p>
            <h1 className="mt-5 max-w-[18ch] text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] text-ink sm:text-[3.25rem] lg:text-display-lg">
              {hero.heading}
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted md:text-xl md:leading-[1.6]">
              {hero.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={hero.primary_cta_href} size="lg">
                {hero.primary_cta_label}
              </ButtonLink>
              <ButtonLink href={hero.secondary_cta_href} variant="secondary" size="lg">
                {hero.secondary_cta_label}
              </ButtonLink>
            </div>
          </div>

          <div className="relative hidden justify-self-end md:block">
            <NetworkField className="absolute -left-16 -top-10 h-[22rem] w-[21rem] opacity-70" />
            <Image
              src="/brand/softronics-mark.png"
              alt="Softronics"
              width={300}
              height={300}
              priority
              className="relative h-[17rem] w-[17rem] lg:h-[19rem] lg:w-[19rem]"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ What we do */}
      <Section id="what-we-do" space="md">
        <div className="grid gap-10 lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">What we do</p>
            <h2 className="text-display-sm font-semibold tracking-[-0.025em] text-ink">
              Four ways we work with organizations.
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-muted">
              Every engagement starts with the problem, in the words of the people who have it.
            </p>
            <Link
              href="/solutions"
              className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-brand-strong hover:text-brand"
            >
              All solutions <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
            {CAPABILITIES.map((capability) => (
              <li
                key={capability.index}
                className="group border-b border-line sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
              >
                <Link href={capability.href} className="block py-7">
                  <span className="font-mono text-[0.6875rem] tracking-[0.12em] text-brand">
                    {capability.index}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.015em] text-ink transition-colors duration-150 group-hover:text-brand-strong">
                    {capability.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                    {capability.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ------------------------------------------------- What we're building */}
      <Section id="building" className="border-y border-line bg-surface" space="md">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="What we're building"
            title="Products in progress."
            lead="Statuses are current and honest. Nothing here is presented as finished before it is."
          />
          <Link
            href="/products"
            className="shrink-0 text-[0.9375rem] font-medium text-brand-strong hover:text-brand"
          >
            All products <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10">
          {missing.length > 0 && (
            <div className="mb-6">
              <SetupNotice missing={missing} context="This section" />
            </div>
          )}

          {products.length > 0 ? (
            <ul className="border-b border-line">
              {products.map((product) => (
                <ProductLine key={product.id} product={product} />
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
      </Section>

      {/* --------------------------------------------------------------- Why us */}
      <Section id="why" space="md">
        <SectionHeading
          eyebrow="Why Softronics"
          title="How we decide what to build, and how to build it."
        />
        <dl className="mt-12 grid gap-x-14 gap-y-9 sm:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <div key={principle.title}>
              <dt className="flex items-baseline gap-3">
                <span className="font-mono text-[0.6875rem] text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">
                  {principle.title}
                </span>
              </dt>
              <dd className="mt-2 pl-8 text-[0.9375rem] leading-relaxed text-muted">
                {principle.body}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* -------------------------------------------------------------- Insights */}
      {posts.length > 0 && (
        <Section space="sm" className="border-t border-line">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Recent writing</h2>
            <Link
              href="/insights"
              className="shrink-0 text-[0.9375rem] font-medium text-brand-strong hover:text-brand"
            >
              All insights <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id} className="bg-surface">
                <Link href={`/insights/${post.slug}`} className="group block h-full p-6">
                  <time
                    dateTime={post.published_at ?? undefined}
                    className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint"
                  >
                    {formatDate(post.published_at)}
                  </time>
                  <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.015em] text-ink transition-colors group-hover:text-brand-strong">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand settings={cta} />
    </>
  );
}
