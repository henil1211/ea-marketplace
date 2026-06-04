import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eavault.com';

  // Base routes
  const staticRoutes = [
    '',
    '/marketplace',
    '/why-us',
    '/how-it-works',
    '/contact',
    '/login',
    '/signup',
    '/request-ea',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Categories routes
  const categories = ['scalping', 'grid', 'gold-trading', 'low-drawdown', 'prop-firm'];
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic EAs from database
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const { readDB } = require('@/lib/db');
    const db = await readDB();
    const eas = db.eas || [];

    dynamicRoutes = eas
      .filter((ea: any) => ea.status === 'active')
      .map((ea: any) => ({
        url: `${baseUrl}/marketplace/${ea.slug}`,
        lastModified: new Date(ea.createdAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
  } catch (err) {
    console.error('Error compiling sitemap dynamic entries:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...dynamicRoutes];
}
