import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/ui/markdown';
import { Section } from '@/components/site/section';
import { PostListItem } from '@/components/site/post-list';
import { getPostSlugs, getPublishedPostBySlug, listPublishedPosts } from '@/lib/db/posts';
import { formatDate, plainText, truncate } from '@/lib/utils';
import { articleJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: false } };
  }

  const description =
    post.seo_description ?? post.excerpt ?? truncate(plainText(post.content), 200);

  return pageMetadata({
    title: post.seo_title ?? post.title,
    description,
    path: `/insights/${post.slug}`,
    image: post.featured_image_url,
    type: 'article',
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  const others = (await listPublishedPosts(4)).filter((entry) => entry.id !== post.id).slice(0, 3);

  const jsonLd = articleJsonLd({
    title: post.title,
    description: post.seo_description ?? post.excerpt ?? truncate(plainText(post.content), 200),
    slug: post.slug,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    author: post.author_name,
    image: post.featured_image_url,
  });

  return (
    <>
      <article>
        <Section space="sm" className="border-b border-line">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
              <li>
                <Link href="/insights" className="transition-colors hover:text-ink">
                  Insights
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[16rem] truncate text-muted">{post.title}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            {post.category && (
              <p className="eyebrow mb-4">{post.category.name}</p>
            )}
            <h1 className="text-[2rem] font-semibold leading-[1.12] tracking-[-0.028em] text-ink md:text-[2.75rem]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">{post.excerpt}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-faint">
              <span>{post.author_name ?? 'Softronics'}</span>
              <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
              {post.reading_minutes && <span>{post.reading_minutes} min read</span>}
            </div>
          </div>
        </Section>

        {post.featured_image_url && (
          <div className="shell mt-10">
            <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-line bg-raised">
              <Image
                src={post.featured_image_url}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

        <Section space="md">
          <Markdown content={post.content} />

          {post.tags.length > 0 && (
            <div className="mt-14 max-w-prose border-t border-line pt-6">
              <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
                Tags
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      </article>

      {others.length > 0 && (
        <Section space="sm" className="border-t border-line bg-surface">
          <h2 className="text-xl font-semibold tracking-[-0.018em] text-ink">Keep reading</h2>
          <div className="mt-6 border-b border-line">
            {others.map((entry) => (
              <PostListItem key={entry.id} post={entry} />
            ))}
          </div>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
