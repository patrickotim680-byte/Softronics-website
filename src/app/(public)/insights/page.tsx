import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import { FeaturedPost, PostListItem } from '@/components/site/post-list';
import { SetupNotice } from '@/components/site/setup-notice';
import { listPublishedPosts } from '@/lib/db/posts';
import { missingSupabaseEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Insights',
  description:
    'Writing from Softronics on software engineering, product decisions and building technology for African organizations.',
  path: '/insights',
});

export default async function InsightsPage() {
  const posts = await listPublishedPosts();
  const missing = missingSupabaseEnv();
  const [latest, ...rest] = posts;

  return (
    <>
      <Section space="sm" className="border-b border-line">
        <SectionHeading
          as="h1"
          eyebrow="Insights"
          title="Notes on what we build and why."
          lead="Engineering decisions, product thinking and observations from working on software in this region. Published from the Softronics CMS."
        />
      </Section>

      <Section space="md">
        {missing.length > 0 && (
          <div className="mb-8">
            <SetupNotice missing={missing} context="This page" />
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyState
            title="No articles published yet"
            description="Articles are written and published in the admin dashboard. Drafts stay private until they are published, and never appear on this page."
          />
        ) : (
          <>
            {latest && <FeaturedPost post={latest} />}
            {rest.length > 0 && (
              <div className="mt-16">
                <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
                  More articles
                </h2>
                <div className="mt-2 border-b border-line">
                  {rest.map((post) => (
                    <PostListItem key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
