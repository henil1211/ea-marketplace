import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import DetailPageClient from './DetailPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch EA details directly from database for SSR
async function getEAData(slug: string) {
  try {
    const { readDB } = require('@/lib/db');
    const db = await readDB();
    const allEas = db.eas || [];
    const ea = allEas.find((e: any) => e.slug === slug && e.status === 'active');
    
    if (!ea) return { ea: null, related: [] };

    // Grab up to 4 related EAs in the same category
    const related = allEas
      .filter((e: any) => e.category === ea.category && e.id !== ea.id && e.status === 'active')
      .slice(0, 4);

    return { ea, related };
  } catch (err) {
    console.error('Error fetching EA details on SSR:', err);
  }
  return { ea: null, related: [] };
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { ea } = await getEAData(resolvedParams.slug);

  if (!ea) {
    return {
      title: 'Expert Advisor Not Found | EA Vault',
      description: 'The requested Expert Advisor listing could not be found.',
    };
  }

  const platforms = ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase();

  return {
    title: `${ea.name} for ${platforms} — Backtested Forex EA | EA Vault`,
    description: `Get ${ea.name} at a cheaper price than MQL5 with verified backtest results, performance stats, and instant download.`,
    alternates: {
      canonical: `https://eavault.com/marketplace/${ea.slug}`,
    },
    openGraph: {
      title: `${ea.name} for ${platforms} — EA Vault`,
      description: `Get ${ea.name} at a cheaper price than MQL5 with verified backtest results, performance stats, and instant download.`,
      url: `https://eavault.com/marketplace/${ea.slug}`,
      type: 'website',
      images: ea.thumbnail ? [ea.thumbnail] : [],
    },
  };
}

export default async function EADetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { ea, related } = await getEAData(resolvedParams.slug);

  if (!ea) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-20 lg:px-12 text-center">
        <h2 className="font-heading text-2xl font-bold">Expert Advisor Not Found</h2>
        <p className="mt-2 font-body text-vault-text-secondary">
          The requested EA could not be loaded or does not exist.
        </p>
        <Link
          href="/marketplace"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-vault-gold px-6 py-3 font-heading text-sm font-bold text-vault-bg hover:bg-vault-gold-light"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  // Schema 1: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://eavault.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Marketplace',
        'item': 'https://eavault.com/marketplace'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': ea.category === 'scalper' ? 'Scalping' : ea.category.charAt(0).toUpperCase() + ea.category.slice(1),
        'item': `https://eavault.com/category/${ea.category === 'scalper' ? 'scalping' : ea.category}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': ea.name,
        'item': `https://eavault.com/marketplace/${ea.slug}`
      }
    ]
  };

  // Schema 2: Product & AggregateRating
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': ea.name,
    'description': ea.shortDesc,
    'category': ea.category,
    'brand': {
      '@type': 'Brand',
      'name': 'EA Vault'
    },
    'offers': {
      '@type': 'Offer',
      'price': ea.ourPrice,
      'priceCurrency': 'USD',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': 'https://schema.org/InStock',
      'url': `https://eavault.com/marketplace/${ea.slug}`
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '18',
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  // Schema 3: FAQPage
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Will this robot work with my specific broker?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes! The EA is compatible with any broker offering MT4 or MT5 platforms. However, ECN brokers with raw spreads and low latency VPS connections are highly recommended for optimal results.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How do I download the robot after purchase?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Downloads are instant. Immediately following order completion, download links will be generated in your user panel and sent directly to your registered email address.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Do you offer assistance with installation?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Absolutely. Every EA package comes with a PDF user manual and setup guidelines. If you run into issues, our support channel is open 24/7 to assist.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Are lifetime updates included in the pricing?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes! Anytime we update an Expert Advisor to adapt to changing market conditions or release bug fixes, you will receive download details for the updated file free of charge.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <DetailPageClient ea={ea} related={related} />
    </>
  );
}
