import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/constants';
import { siteUrl } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Variable font: no explicit weight list, so Next ships one optimised file.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'Softronics',
    'software development Africa',
    'custom software',
    'business systems',
    'AI automation',
    'web applications',
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: '/brand/favicon.ico', sizes: 'any' },
      { url: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/brand/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/brand/apple-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    url: siteUrl,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: '/og/og-default.png', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    images: ['/og/og-default.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1220',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
