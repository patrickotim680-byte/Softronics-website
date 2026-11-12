import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { getGeneralSettings } from '@/lib/db/settings';
import { listPublishedPosts } from '@/lib/db/posts';
import { organizationJsonLd } from '@/lib/seo';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings, posts] = await Promise.all([getGeneralSettings(), listPublishedPosts(3)]);
  // An empty blog looks abandoned, so Insights only appears in navigation once there are 3 posts.
  const showInsights = posts.length >= 3;

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader showInsights={showInsights} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} showInsights={showInsights} />
      <script
        type="application/ld+json"
        // Structured data only, no user input, so this cannot inject markup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
