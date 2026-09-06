import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

import '@/styles/globals.css';
// Imported here rather than from globals.css so Next resolves and rebases the webfont
// URLs itself, which is the reliable path for a package's own CSS.
import 'bootstrap-icons/font/bootstrap-icons.css';
import { LegacyHashRedirect } from '@/components/LegacyHashRedirect';

export const metadata: Metadata = {
  title: 'Gasilski kviz',
  description: 'Gasilski kviz in literatura – PGD Veliko Mlačevo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // was lang="en"
    <html lang="sl">
      <body className="min-h-screen">
        {children}
        <LegacyHashRedirect />
        <Analytics />
      </body>
    </html>
  );
}
