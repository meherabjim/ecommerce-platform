import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/track-order`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
