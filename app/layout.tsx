import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

import '@/styles/globals.scss';
import { LegacyHashRedirect } from '@/components/LegacyHashRedirect';

export const metadata: Metadata = {
  title: 'Gasilski kviz',
  description: 'Gasilski kviz in literatura – PGD Veliko Mlačevo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // was lang="en"
    <html lang="sl">
      <body>
        {/* This container was the old MainLayout, which collapses into the root layout. */}
        <div className="container">{children}</div>
        <LegacyHashRedirect />
        <Analytics />
      </body>
    </html>
  );
}
