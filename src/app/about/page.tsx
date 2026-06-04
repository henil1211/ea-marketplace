import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionButton, MotionCard, MouseGlowCard } from '@/components/motion/MotionPrimitives';

export const metadata: Metadata = {
  title: 'About Us — Premium Forex Expert Advisors | EA Vault',
  description: 'Learn why EA Vault was created: bringing institutional-grade automated trading systems and MetaTrader EAs to retail traders at affordable pricing.',
  alternates: {
    canonical: 'https://eavault.com/about',
  },
  openGraph: {
    title: 'About EA Vault — Premium Trading EAs',
    description: 'Learn why EA Vault was created: bringing institutional-grade automated trading systems and MetaTrader EAs to retail traders at affordable pricing.',
    url: 'https://eavault.com/about',
    type: 'website',
  },
};

export default function AboutPage() {
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
        'name': 'About Us',
        'item': 'https://eavault.com/about'
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
          <span className="text-vault-text-secondary">About Us</span>
        </nav>

        {/* Hero Section */}
        <Reveal as="section" className="mb-16 text-center max-w-3xl mx-auto pt-6">
          <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
            Our Journey & Vision
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-6xl">
            About <span className="text-vault-gold">EAVault</span>
          </h1>
          <p className="mt-6 font-body text-base text-vault-text-secondary leading-relaxed">
            Bridging the gap between elite algorithmic trading tools and retail traders. We source, unlock, and deliver verified automated trading systems at a fraction of standard marketplace prices.
          </p>
        </Reveal>

        {/* Mission Section */}
        <Reveal as="section" className="mb-20 rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface via-vault-bg to-vault-surface p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-chart-grid opacity-10" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-heading text-2xl font-bold text-vault-text">
                Democratizing Algorithmic Trading
              </h2>
              <p className="font-body text-sm text-vault-text-secondary leading-relaxed">
                The MQL5 marketplace and institutional providers often charge thousands of dollars for automated Expert Advisors (EAs). For many retail traders, these high licensing costs consume their entire starting capital, leaving nothing left to trade.
              </p>
              <p className="font-body text-sm text-vault-text-secondary leading-relaxed">
                <strong>EA Vault</strong> was established to solve this problem. We acquire original premium Expert Advisors, test them rigorously, remove arbitrary licensing limits, and deliver fully functional, unlimited trading bots. We help traders access institutional-grade strategies without the premium price tag.
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-48 h-48 rounded-full bg-vault-gold/5 border border-vault-gold/10 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-vault-gold/10 border border-vault-gold/20 flex items-center justify-center">
                  <span className="text-5xl">🛡️</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Why Choose Us Section */}
        <section className="mb-20">
          <Reveal className="text-center mb-10">
            <h2 className="font-heading text-2xl font-bold text-vault-text">Why Traders Choose EA Vault</h2>
            <p className="mt-2 font-body text-xs text-vault-text-muted">Built on transparency, support, and premium performance.</p>
          </Reveal>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevealItem>
              <MouseGlowCard className="h-full rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
                <span className="text-3xl">💎</span>
                <h3 className="font-heading text-base font-bold text-vault-text">Unbeatable Prices</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  Save up to 90% off standard prices. Get identical code files, fully unlocked with no account limitations.
                </p>
              </MouseGlowCard>
            </RevealItem>

            <RevealItem>
              <MouseGlowCard className="h-full rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
                <span className="text-3xl">📈</span>
                <h3 className="font-heading text-base font-bold text-vault-text">Verified Backtests</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  We don&apos;t guess. Every EA features real tick backtesting records and profit curves so you trade with confidence.
                </p>
              </MouseGlowCard>
            </RevealItem>

            <RevealItem>
              <MouseGlowCard className="h-full rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
                <span className="text-3xl">💬</span>
                <h3 className="font-heading text-base font-bold text-vault-text">Real Human Support</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  Got questions or setup issues? Get 24/7 dedicated support via WhatsApp and Email from experienced operators.
                </p>
              </MouseGlowCard>
            </RevealItem>

            <RevealItem>
              <MouseGlowCard className="h-full rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
                <span className="text-3xl">🔍</span>
                <h3 className="font-heading text-base font-bold text-vault-text">Custom Sourcing</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  Looking for a specific bot from MQL5, Telegram, or private groups? Let us know, and we will source and unlock it.
                </p>
              </MouseGlowCard>
            </RevealItem>
          </StaggerReveal>
        </section>

        {/* Stats Section */}
        <Reveal as="section" className="mb-20 rounded-2xl border border-vault-border bg-vault-surface p-8 relative overflow-hidden">
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-vault-border">
            <RevealItem className="pt-6 sm:pt-0">
              <p className="font-heading text-4xl sm:text-5xl font-extrabold text-vault-gold">50+</p>
              <p className="mt-2 font-body text-xs text-vault-text-muted uppercase tracking-wider">Premium EAs Sourced</p>
            </RevealItem>
            <RevealItem className="pt-6 sm:pt-0">
              <p className="font-heading text-4xl sm:text-5xl font-extrabold text-vault-profit">5,000+</p>
              <p className="mt-2 font-body text-xs text-vault-text-muted uppercase tracking-wider">Active Traders Served</p>
            </RevealItem>
            <RevealItem className="pt-6 sm:pt-0">
              <p className="font-heading text-4xl sm:text-5xl font-extrabold text-vault-text">1,200+</p>
              <p className="mt-2 font-body text-xs text-vault-text-muted uppercase tracking-wider">Custom EAs Sourced</p>
            </RevealItem>
          </StaggerReveal>
        </Reveal>

        {/* CTA Section */}
        <Reveal as="section" className="text-center max-w-xl mx-auto space-y-6 pb-12">
          <h2 className="font-heading text-2xl font-bold text-vault-text">Ready to Automate Your Success?</h2>
          <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
            Explore our curated list of Expert Advisors or contact our team to source a custom trading robot suited to your strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MotionButton className="w-full sm:w-auto">
              <Link
                href="/marketplace"
                className="block w-full text-center rounded-xl bg-vault-gold px-8 py-3.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
              >
                Browse Marketplace
              </Link>
            </MotionButton>
            <MotionButton className="w-full sm:w-auto">
              <Link
                href="/contact"
                className="block w-full text-center rounded-xl border border-vault-border bg-vault-surface-high px-8 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
              >
                Contact Us
              </Link>
            </MotionButton>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
