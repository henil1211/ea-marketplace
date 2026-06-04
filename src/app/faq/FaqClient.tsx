'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StaggerReveal, RevealItem } from '@/components/motion/Reveal';

interface FaqItem {
  q: string;
  a: string;
  category: 'general' | 'purchases' | 'installation' | 'backtests' | 'support' | 'requests';
}

const FAQ_DATA: FaqItem[] = [
  // General
  {
    q: 'What is EA Vault?',
    a: 'EA Vault is a curated marketplace that offers premium MetaTrader 4 & 5 Expert Advisors (EAs) at highly accessible prices. We acquire top-rated automated systems, remove restrictive account-locking licenses, and distribute them to retail traders to democratize algorithmic trading.',
    category: 'general'
  },
  {
    q: 'Are these trading robots legal to use?',
    a: 'Yes. All files are fully unlocked backup binaries compiled for educational use, optimization tests, and retail backup purposes. You can run them without restriction on any demo or live broker account.',
    category: 'general'
  },
  {
    q: 'What platforms are supported by your EAs?',
    a: 'Each Expert Advisor page clearly states whether it is compiled for MetaTrader 4 (MT4) or MetaTrader 5 (MT5). EAs are not cross-compatible (an MT4 EA cannot run on an MT5 terminal, and vice-versa).',
    category: 'general'
  },
  // Purchases
  {
    q: 'How do I download my Expert Advisor after payment?',
    a: 'Downloads are instant. Immediately after purchase, a download button will be generated in your dashboard. You will also receive an automated email containing secure download links and setup setfiles.',
    category: 'purchases'
  },
  {
    q: 'Are there any recurring licensing fees?',
    a: 'No. All EAs listed on EA Vault are one-time payments for lifetime ownership. There are no monthly subscriptions, hidden maintenance fees, or volume-based commissions.',
    category: 'purchases'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept credit cards, debit cards, and secure cryptocurrency payments (USDT, BTC, ETH). If you prefer manual payments or bank transfers, please contact us directly on WhatsApp.',
    category: 'purchases'
  },
  // Installation
  {
    q: 'How do I install the EA on my MetaTrader platform?',
    a: 'Installation is simple: 1. Open your MT4/MT5 terminal. 2. Click File > Open Data Folder. 3. Navigate to MQL4/MQL5 > Experts. 4. Paste the downloaded .ex4/.ex5 file. 5. Restart your terminal, drag the EA onto the recommended chart, and enable "Allow Algo Trading / Live Trading" in the terminal settings.',
    category: 'installation'
  },
  {
    q: 'Do I need a Virtual Private Server (VPS)?',
    a: 'While not strictly mandatory, we highly recommend a trading VPS. A VPS keeps your MetaTrader platform running 24/7 without interruption and provides ultra-low latency (under 5ms) to broker servers for optimal execution speeds.',
    category: 'installation'
  },
  {
    q: 'Can I use the EA on unlimited demo and live accounts?',
    a: 'Yes! Since we unlock the files, all account licensing restrictions are fully removed. You are free to run the EAs on as many demo accounts, personal live accounts, and prop firm accounts as you like.',
    category: 'installation'
  },
  // Backtests
  {
    q: 'What data do you use to backtest your EAs?',
    a: 'We execute all simulations using 99.9% real tick historical data with real variable spreads, commission levels, and simulated execution slippage to ensure results represent realistic live trading conditions.',
    category: 'backtests'
  },
  {
    q: 'Why do my live trading results differ from the backtests?',
    a: 'Slight deviations are normal due to broker-specific spreads, swap fees, daily rollovers, latency, and slippage. We always advise running any new EA on a demo account for 2-4 weeks to understand its live performance.',
    category: 'backtests'
  },
  // Support
  {
    q: 'What type of support do you provide?',
    a: 'We provide full setup assistance. If you have questions about charts, preset files (setfiles), or account risks, you can reach out via our 24/7 support email or contact our operators directly on WhatsApp.',
    category: 'support'
  },
  {
    q: 'Are updates included if the developer changes the EA?',
    a: 'Yes, lifetime updates are free. When a new version is released to fix bugs or optimize performance for new market conditions, the file in your dashboard will be updated automatically.',
    category: 'support'
  },
  // Custom Requests
  {
    q: 'Can you source a specific EA that isn\'t listed on your store?',
    a: 'Absolutely. We have a dedicated custom sourcing department. If you have a robot in mind from MQL5, Telegram channels, or private trading circles, submit a request via our "Request EA" page, and we will source and unlock it for you.',
    category: 'requests'
  },
  {
    q: 'What is the price and timeline for custom EA requests?',
    a: 'Custom sourcing costs vary depending on the EA\'s availability and security systems. Most requests are processed within 1 to 3 business days.',
    category: 'requests'
  }
];

const CATEGORIES = [
  { value: 'all', label: 'All FAQs' },
  { value: 'general', label: 'General' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'installation', label: 'EA Installation' },
  { value: 'backtests', label: 'Backtests' },
  { value: 'support', label: 'Support' },
  { value: 'requests', label: 'Custom Requests' }
];

export default function FaqClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter EAs based on category selection and search text
  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-vault-border pb-6">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search FAQs (e.g. VPS, Install, Refund)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-vault-border bg-vault-surface px-4 py-3 pl-11 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />
          <svg
            className="absolute left-4 top-3.5 h-4 w-4 text-vault-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Categories select (mobile only) / buttons grid (desktop) */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value);
                setOpenIndex(null);
              }}
              className={`rounded-xl px-4 py-2 font-heading text-xs font-semibold border transition-all ${
                activeCategory === cat.value
                  ? 'bg-vault-gold border-vault-gold text-vault-bg shadow-[0_4px_12px_rgba(240,185,11,0.2)]'
                  : 'bg-vault-surface border-vault-border text-vault-text-secondary hover:border-vault-gold/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs Accordion Grid */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-vault-border bg-vault-surface">
          <span className="text-3xl">🔍</span>
          <h3 className="mt-4 font-heading text-base font-bold text-vault-text">No FAQ matches found</h3>
          <p className="mt-1 font-body text-xs text-vault-text-secondary">Try refining your search keyword or selecting a different category.</p>
        </div>
      ) : (
        <StaggerReveal className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <RevealItem key={idx}>
                <div className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden transition-colors hover:border-vault-border-high">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-heading text-sm font-bold text-vault-text bg-vault-surface hover:bg-vault-surface-high/20 transition-colors focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-vault-gold font-body text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-vault-gold/10 border border-vault-gold/15">
                        {faq.category}
                      </span>
                      {faq.q}
                    </span>
                    <span className="text-vault-gold font-mono text-lg font-bold">{isOpen ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="p-5 border-t border-vault-border font-body text-xs text-vault-text-secondary leading-relaxed bg-vault-bg/15">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealItem>
            );
          })}
        </StaggerReveal>
      )}
    </div>
  );
}
