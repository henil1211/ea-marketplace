import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { PageShell, Reveal } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';
import FeaturedClient from './FeaturedClient';

export const metadata: Metadata = {
  title: 'Featured Expert Advisors — Handpicked Automated Trading Systems | EA Vault',
  description: 'Browse handpicked premium Expert Advisors on EA Vault. Fully unlocked binaries, high profit factors, and verified backtest records.',
  alternates: {
    canonical: 'https://eavault.com/featured',
  },
  openGraph: {
    title: 'EA Vault Featured Expert Advisors',
    description: 'Browse handpicked premium Expert Advisors on EA Vault. Fully unlocked binaries, high profit factors, and verified backtest records.',
    url: 'https://eavault.com/featured',
    type: 'website',
  },
};

export default async function FeaturedPage() {
  let eas = [];
  let hidePublicPrices = false;

  try {
    const { readDB } = require('@/lib/db');
    const db = await readDB();
    eas = db.eas || [];
    const settings = db.settings || [];
    if (settings.length > 0) {
      hidePublicPrices = !!settings[0].hidePublicPrices;
    }
  } catch (err) {
    console.error('Error loading EAs for featured page:', err);
  }

  // Filter only featured and active ones
  const featuredEas = eas.filter((ea: any) => ea.featured === true && ea.status === 'active');

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
        'name': 'Featured EAs',
        'item': 'https://eavault.com/featured'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageShell>
        {/* Breadcrumbs */}
        <nav className="mb-6 flex gap-2 font-body text-xs text-vault-text-muted">
          <Link href="/" className="hover:text-vault-gold">Home</Link>
          <span>/</span>
          <span className="text-vault-text-secondary">Featured EAs</span>
        </nav>

        {/* Hero Banner Section */}
        <section className="mb-10 rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface via-vault-bg to-vault-surface p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-chart-grid opacity-10" />
          <div className="relative z-10 max-w-3xl">
            <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
              Curated Masterpieces
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-vault-text sm:text-5xl">
              Featured Expert <span className="text-vault-gold">Advisors</span>
            </h1>
            <p className="mt-4 font-body text-sm sm:text-base text-vault-text-secondary leading-relaxed">
              Explore our select elite robots, handpicked for superior risk-to-reward metrics, verified profit factors, and long-term history of drawdown safety.
            </p>
          </div>
        </section>

        {/* Featured Client Grid */}
        <section className="mb-16">
          <FeaturedClient eas={featuredEas} hidePublicPrices={hidePublicPrices} />
        </section>

        {/* WhatsApp Sourcing CTA */}
        <Reveal as="section" className="mb-12 rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface via-vault-bg to-vault-surface p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-chart-grid opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-heading text-2xl font-bold text-vault-text">Looking for a Specific Trading System?</h2>
            <p className="font-body text-xs sm:text-sm text-vault-text-secondary max-w-xl mx-auto leading-relaxed">
              If the EA you want is not currently listed under our featured selection, we can source it for you from any community, MQL5 profile, or private team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MotionButton className="w-full sm:w-auto">
                <a
                  href="https://wa.me/message/YOUR_WHATSAPP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 rounded-xl bg-[#25D366] text-white px-8 py-3.5 font-heading text-xs font-bold shadow-lg shadow-[#25D366]/10 hover:opacity-95 transition-opacity"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
                  </svg>
                  Request Sourced EA via WhatsApp
                </a>
              </MotionButton>
              <MotionButton className="w-full sm:w-auto">
                <Link
                  href="/request-ea"
                  className="block w-full text-center rounded-xl border border-vault-border bg-vault-surface-high px-8 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
                >
                  Fill Sourcing Form
                </Link>
              </MotionButton>
            </div>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
