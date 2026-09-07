import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site/header';
import { SiteFooter } from '@/components/site/footer';
import { getGeneralSettings } from '@/lib/db/settings';
import { organizationJsonLd } from '@/lib/seo';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getGeneralSettings();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <script
        type="application/ld+json"
        // Structured data only, no user input, so this cannot inject markup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
