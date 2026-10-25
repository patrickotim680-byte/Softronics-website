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
      <Section space="lg">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Insights"
          title="Notes on what we build and why."
          lead="Engineering decisions, product thinking and lessons from building software in this region."
        />
      </Section>

      <Section space="md" className="bg-raised">
        {missing.length > 0 && (
          <div className="mb-8">
            <SetupNotice missing={missing} context="This page" />
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyState
            title="Nothing published yet"
            description="Our first articles are on the way. Follow us to hear when they land."
          />
        ) : (
          <>
            {latest && <FeaturedPost post={latest} />}
            {rest.length > 0 && (
              <div className="mt-16">
                <h2 className="text-[1.5rem] font-semibold tracking-[-0.025em] text-ink">
                  More articles
                </h2>
                <div className="mt-4 border-b border-ink/[0.08]">
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
