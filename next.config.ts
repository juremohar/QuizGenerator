import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Deliberately NOT setting `cacheComponents`: it would require Suspense
  // boundaries around the per-request quiz shuffle and every inventory DB read.
  // Deliberately NOT adding a `webpack` key: `next build` fails if one exists.
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // NOT immutable: the brigade replaces PDFs in place under the same name.
        source: '/literatura/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;
