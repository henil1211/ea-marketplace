import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import { formatPrice, calcDiscount } from '@/lib/utils';
import CategoryClient from './CategoryClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Generate category details based on slug
function getCategoryInfo(slug: string) {
  switch (slug) {
    case 'scalping':
      return {
        title: 'High-Frequency Scalping EAs for MetaTrader 4 & 5',
        description: 'Verified automated scalper trading systems. Capture micro-pip moves with high-precision momentum algorithms, low drawdowns, and news filters.',
        longIntro: 'Scalping Expert Advisors (EAs) represent the pinnacle of automated trading accuracy. By targeting micro-movements in highly liquid currency pairs and gold, these robots exploit short-term momentum shifts. For maximum performance, run these EAs on ECN raw spread brokers with high-speed VPS connections.',
        faqs: [
          { q: 'What is the recommended spread for scalping EAs?', a: 'Scalping robots require ultra-low spreads. We recommend ECN raw spread accounts from brokers like IC Markets, Pepperstone, or Tickmill, where spreads on EURUSD frequently stay at 0.0 to 0.2 pips.' },
          { q: 'Is a VPS mandatory for running a scalper EA?', a: 'Yes, a high-performance VPS with less than 5ms latency to your broker server is highly recommended to prevent slippage and trade execution delay.' },
          { q: 'Do these scalper EAs include news filters?', a: 'Most of our premium scalping EAs include built-in economic news filters that automatically disable trading 30 minutes before and after high-impact macroeconomic events.' }
        ]
      };
    case 'grid':
      return {
        title: 'High Yield Grid Trading EAs & Robots',
        description: 'Capitalize on ranging markets with advanced mathematical grid models. Configured with smart trailing exits and equity safety limits.',
        longIntro: 'Grid Expert Advisors place buy and sell orders at regular intervals above or below the current price to profit from volatility fluctuations. Unlike simplistic martingale bots, our grid systems employ smart equity protectors, dynamic grid spacing based on ATR, and stop-loss protocols to secure your account balance.',
        faqs: [
          { q: 'How does grid trading handle strong trend breakaways?', a: 'Our curated grid EAs monitor average true range (ATR) and do not open martingale layers against strong daily trends. They feature global portfolio drawdown limits to close basket trades before major risk levels are reached.' },
          { q: 'What is the minimum deposit for grid trading systems?', a: 'Grid bots open multiple trades concurrently. We recommend a minimum deposit of $1,000 for standard accounts, or running them on cent accounts with smaller contract sizes.' },
          { q: 'Can I customize the grid distance and grid step size?', a: 'Yes, all grid EAs come with input presets (setfiles) that are fully customizable via the MetaTrader terminal input properties panel.' }
        ]
      };
    case 'gold-trading':
      return {
        title: 'Automated Gold (XAUUSD) Trading Robots',
        description: 'Trade Gold automatically with optimized momentum scalpers and trend followers designed specifically for XAUUSD volatility.',
        longIntro: 'Gold (XAUUSD) is known for its high volatility and rapid trends. Traditional currency EAs often fail on gold due to its unique average range. Our dedicated Gold Trading robots are trained specifically on historical gold tick data to navigate breakouts and reversal blocks without excessive drawdown.',
        faqs: [
          { q: 'Why do I need a specialized EA for gold trading?', a: 'Gold behaves differently than major forex currencies, exhibiting larger daily ranges and stronger breakout trends. Generalized EAs often exhaust margin during gold rallies. Dedicated gold EAs use parameters optimized specifically for gold spreads and swap fees.' },
          { q: 'What timeframes do Gold EAs trade on?', a: 'Our gold systems are primarily optimized for lower timeframes like M1, M5, or M15 for scalping breakouts, and H1 or H4 for daily trend accumulation.' },
          { q: 'Is gold trading compatible with prop firms?', a: 'Yes, we offer prop firm optimized gold EAs that strictly adhere to FTMO and FundedNext max drawdown limits.' }
        ]
      };
    case 'low-drawdown':
      return {
        title: 'Low Drawdown & Low Risk Expert Advisors',
        description: 'Consistent account growth with capital preservation at the forefront. Sub-5% drawdown limits with strict stop-losses on every trade.',
        longIntro: 'If capital preservation is your highest priority, our Low Drawdown collection is curated for you. These Expert Advisors do not use grids or martingale hedging. Every single trade opened has a hard stop-loss registered with the broker, and risk per trade is strictly capped between 0.5% and 2.0% of equity.',
        faqs: [
          { q: 'What makes these EAs low drawdown?', a: 'These systems exit losing trades immediately. They do not hold open trades in hope of a recovery and never increase lot sizes to recover losses, keeping maximum historical drawdown under 8%.' },
          { q: 'Are low drawdown EAs suitable for large retirement accounts?', a: 'Yes, they are engineered specifically for conservative growth. Many traders run these robots on institutional and large private capital accounts.' },
          { q: 'What is the expected monthly return of low risk EAs?', a: 'Depending on your risk allocation (e.g. 1% or 2% per trade), monthly returns typically average between 3% and 8% with extremely smooth equity growth curves.' }
        ]
      };
    case 'prop-firm':
      return {
        title: 'Prop Firm Safe Trading Bots — FTMO/FundedNext',
        description: 'Pass your prop challenge and keep your funded account with strict daily drawdown limits, news protection, and commission optimized variables.',
        longIntro: 'Prop firm challenges demand strict discipline, capping maximum daily losses at 5% and overall losses at 10%. Our Prop Firm EAs are custom-designed with trailing equity filters, daily profit target locks, and indicators that track prop firm server times to protect your account from accidental violations.',
        faqs: [
          { q: 'Can these EAs pass evaluation challenges automatically?', a: 'Yes. They are programmed to run during liquid hours to meet the required profit targets while maintaining drawdown levels well within standard FTMO and FundedNext criteria.' },
          { q: 'Do these EAs violate prop firm rules on HFT or news trading?', a: 'We specify prop firm compatibility in detail for each robot. Most systems utilize standard entry methods acceptable by 99% of funding companies.' },
          { q: 'How does the daily drawdown limit protect my account?', a: 'The EA calculates the starting equity at the daily server reset. If current equity drops near the daily limit (e.g. 4.5%), the EA immediately closes all open orders and disables itself until the next trading day.' }
        ]
      };
    case 'mt4':
      return {
        title: 'MetaTrader 4 (MT4) Expert Advisors & Robots',
        description: 'Download premium MetaTrader 4 Expert Advisors. Fully unlocked MT4 EAs with verified backtests and optimized settings.',
        longIntro: 'MetaTrader 4 remains the world\'s most popular platform for retail forex trading. Our curated collection of MT4 Expert Advisors includes highly optimized scalpers, grids, and trend-following algorithms. Every robot is fully compatible with standard MT4 broker terminals and includes setfiles.',
        faqs: [
          { q: 'Can I use these MT4 EAs on MetaTrader 5?', a: 'No, MT4 and MT5 use different programming languages (MQL4 vs MQL5). These specific files are compiled for MetaTrader 4 only. If you use MT5, please browse our MT5 category.' },
          { q: 'How do I install an EA on MetaTrader 4?', a: 'Open your MT4 terminal, go to File > Open Data Folder, navigate to MQL4 > Experts, and paste the downloaded .ex4 file there. Restart MT4, drag the EA onto your chart, and ensure "Allow Live Trading" is checked.' },
          { q: 'Do these MT4 EAs work on MT4 prop firm accounts?', a: 'Yes, most of our EAs are compatible with MT4 prop firm servers. Check the specific product description for prop-safety certifications.' }
        ]
      };
    case 'mt5':
      return {
        title: 'MetaTrader 5 (MT5) Expert Advisors & Robots',
        description: 'Download premium MetaTrader 5 Expert Advisors. Next-gen MT5 EAs optimized for multi-asset execution and fast backtests.',
        longIntro: 'MetaTrader 5 is the modern successor to MT4, offering faster backtesting speeds, native multi-currency support, and superior execution. Our MT5 Expert Advisors leverage the full power of the MQL5 language to trade forex, gold, indices, and crypto with high efficiency.',
        faqs: [
          { q: 'Is MetaTrader 5 better for running trading robots?', a: 'Yes, MT5 supports multi-threaded backtests and real tick historical data, allowing for much more accurate simulation and optimization than MT4.' },
          { q: 'Are these MT5 EAs fully unlocked?', a: 'Yes, all our MT5 EAs are fully unlocked binaries (.ex5) with no account restrictions or licensing limits. You can run them on unlimited demo and live accounts.' },
          { q: 'Do I need a special broker account for MT5 EAs?', a: 'You need a broker that supports MetaTrader 5. Most modern brokers (like IC Markets, Exness, Pepperstone) offer both MT4 and MT5 account types.' }
        ]
      };
    default:
      return {
        title: 'Expert Advisors Catalog',
        description: 'Browse top MetaTrader trading robots at unbeatable discount rates compared to MQL5 marketplace.',
        longIntro: 'Explore premium EA Vault selections with verified backtests and complete unlocked binaries.',
        faqs: []
      };
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const info = getCategoryInfo(slug);
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${name} EAs for MT4/MT5 — Premium Forex Robots | EA Vault`,
    description: info.description,
    alternates: {
      canonical: `https://eavault.com/category/${slug}`,
    },
    openGraph: {
      title: `${name} Expert Advisors | EA Vault`,
      description: info.description,
      url: `https://eavault.com/category/${slug}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const info = getCategoryInfo(slug);

  // Read EAs database on the server
  let eas = [];
  try {
    const { readDB } = require('@/lib/db');
    const db = await readDB();
    const allEas = db.eas || [];

    // Filter logic on the server to retrieve relevant EAs
    if (slug === 'scalping') {
      eas = allEas.filter((e: any) => e.category === 'scalper');
    } else if (slug === 'grid') {
      eas = allEas.filter((e: any) => e.category === 'grid');
    } else if (slug === 'gold-trading') {
      eas = allEas.filter((e: any) => e.tags.includes('gold') || e.category === 'scalper' && e.tags.includes('xauusd'));
    } else if (slug === 'low-drawdown') {
      eas = allEas.filter((e: any) => e.maxDrawdown <= 8 || e.tags.includes('low-drawdown'));
    } else if (slug === 'prop-firm') {
      eas = allEas.filter((e: any) => e.propFirmCompatible === true || e.tags.includes('prop-firm'));
    } else if (slug === 'mt4') {
      eas = allEas.filter((e: any) => e.platform.toLowerCase() === 'mt4' || e.platform.toLowerCase() === 'both');
    } else if (slug === 'mt5') {
      eas = allEas.filter((e: any) => e.platform.toLowerCase() === 'mt5' || e.platform.toLowerCase() === 'both');
    } else {
      eas = allEas;
    }
  } catch (err) {
    console.error('Error loading EAs for category page:', err);
  }

  // Breadcrumbs list schema
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
        'name': slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        'item': `https://eavault.com/category/${slug}`
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': info.faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  const otherCategories = [
    { name: 'Scalping', path: 'scalping' },
    { name: 'Grid Trading', path: 'grid' },
    { name: 'Gold Robots', path: 'gold-trading' },
    { name: 'Low Drawdown', path: 'low-drawdown' },
    { name: 'Prop Firm Safe', path: 'prop-firm' }
  ].filter(c => c.path !== slug);

  return (
    <>
      {/* Dynamic SEO JSON-LD scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex gap-2 font-body text-xs text-vault-text-muted">
          <Link href="/" className="hover:text-vault-gold">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-vault-gold">Marketplace</Link>
          <span>/</span>
          <span className="text-vault-text-secondary capitalize">{slug.replace('-', ' ')}</span>
        </nav>

        {/* Hero Banner Section */}
        <section className="mb-10 rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface via-vault-bg to-vault-surface p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-chart-grid opacity-10" />
          <div className="relative z-10 max-w-3xl">
            <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
              Premium Algorithmic Showcase
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-vault-text sm:text-5xl">
              {info.title}
            </h1>
            <p className="mt-4 font-body text-sm sm:text-base text-vault-text-secondary leading-relaxed">
              {info.longIntro}
            </p>
          </div>
        </section>

        {/* Render Category Client Grid */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Grid area */}
          <div className="lg:col-span-9 space-y-8">
            <CategoryClient eas={eas} />

            {/* Curated Category FAQs */}
            <div className="border-t border-vault-border pt-12">
              <h2 className="font-heading text-xl font-bold text-vault-text mb-6">
                Frequently Asked Questions ({slug.replace('-', ' ')})
              </h2>
              <div className="space-y-4">
                {info.faqs.map((faq, index) => (
                  <div key={index} className="rounded-xl border border-vault-border bg-vault-surface p-5">
                    <h3 className="font-heading text-sm font-bold text-vault-text mb-2 flex gap-2">
                      <span className="text-vault-gold">Q:</span>
                      {faq.q}
                    </h3>
                    <p className="font-body text-xs text-vault-text-secondary leading-relaxed pl-5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Internal linking */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-vault-text border-b border-vault-border pb-2">
                Explore Other Categories
              </h3>
              <div className="flex flex-col gap-2">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.path}
                    href={`/category/${cat.path}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-vault-border/50 hover:border-vault-gold/40 hover:bg-vault-bg/40 font-body text-xs text-vault-text transition-all"
                  >
                    <span>{cat.name} EAs</span>
                    <span className="text-vault-gold">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Security Guarantee Widget */}
            <div className="rounded-2xl border border-vault-gold/20 bg-vault-gold/5 p-5 space-y-3">
              <h4 className="font-heading text-xs font-extrabold text-vault-gold uppercase">
                🛡️ EAVault Direct Guarantee
              </h4>
              <p className="font-body text-[11px] text-vault-text-secondary leading-relaxed">
                All Expert Advisors list verified simulation results run on real market ticks with slippage settings enabled. Files downloaded are fully unlocked executable configurations (.ex4/.ex5 files).
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
