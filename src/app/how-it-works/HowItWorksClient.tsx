'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { PageShell, Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MagneticButton, MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';

export default function HowItWorksClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const steps = [
    {
      num: '01',
      title: 'Browse EAs',
      desc: [
        'Explore our marketplace of MT4 and MT5 Expert Advisors',
        'Filter by category, platform, win rate, and strategy type',
        'View complete backtest data and performance stats',
      ],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Compare & Analyze',
      desc: [
        'Compare original MQL5 prices with our discounted pricing',
        'Analyze drawdown, profit factor, and monthly returns',
        'Read FAQs and trader reviews',
      ],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21M18 7L14 12L10 9L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Consult & Order',
      desc: [
        'Connect with our support desk directly on WhatsApp',
        'Specify your preferred trading platform and broker settings',
        'Secure manual payment options and personalized invoice generation',
      ],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15V17M12 9V11M9 22H15C18.771 22 20.657 22 21.8285 20.8285C23 19.657 23 17.771 23 14V10C23 6.229 23 4.343 21.8285 3.1715C20.657 2 18.771 2 15 2H9C5.229 2 3.343 2 2.1715 3.1715C1 4.343 1 6.229 1 10V14C1 17.771 1 19.657 2.1715 20.8285C3.343 22 5.229 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Personalized Delivery',
      desc: [
        'Receive custom compiled EA files matching your credentials',
        'Includes tailor-made risk set files optimized for your broker',
        'Get step-by-step video installation support from our experts',
      ],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V16M12 16L8 12M12 16L16 12M19 21H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      num: '05',
      title: 'Install & Trade',
      desc: [
        'Add the EA to MT4 or MT5',
        'Configure recommended settings',
        'Start automated trading with your preferred broker',
      ],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  const features = [
    {
      title: 'Lower Prices Than MQL5',
      desc: 'Save up to 80% on high-quality Expert Advisors by bypassing steep marketplace listing fees and high developer markups.',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vault-gold/10 text-vault-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18M12 6C11 5 9.5 4.5 8 4.5C6.5 4.5 5 5 4 6M12 6C13 5 14.5 4.5 16 4.5C17.5 4.5 19 5 20 6M12 18C11 17 9.5 16.5 8 16.5C6.5 16.5 5 17 4 18M12 18C13 17 14.5 16.5 16 16.5C17.5 16.5 19 17 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
    },
    {
      title: 'Verified Backtest Results',
      desc: 'No black boxes. We verify performance with multi-year strategy test reports, balance/equity curves, and drawdown statistics.',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-vault-profit/10 text-vault-profit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
    },
    {
      title: 'Instant Digital Delivery',
      desc: 'Zero delays. Get immediate access to your files, preset files, and user documentation directly inside your account panel.',
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
    },
    {
      title: 'Dedicated EA Request Service',
      desc: "Can't find a specific trading strategy or robot listing? Request it directly, and we will source and unlock it for you.",
      icon: (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 14.5L12 18L19.5 7.5M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
    },
  ];

  const faqs = [
    {
      q: 'Are these the same EAs sold on MQL5?',
      a: 'Yes, these are the exact same compiled .ex4/.ex5 files. We source them from verified buyers and community databases, allowing you to bypass the steep commissions and high developer markups of the MQL5 market.',
    },
    {
      q: 'Do I receive lifetime access?',
      a: 'Absolutely. Once you complete your purchase, the files are linked to your profile forever. You can redownload them at any point from your personal dashboard and execute them without terminal limitations.',
    },
    {
      q: 'How fast is delivery?',
      a: 'Delivery is instant. The moment your transaction completes, the download files, configuration setups, and license credentials are immediately unlocked in your Account Dashboard.',
    },
    {
      q: 'Can I request any EA?',
      a: "Yes! If an Expert Advisor you want is not currently listed in our catalog, simply visit the 'Request EA' page and submit the details. We will scour our community network and archives to source it for you within 24 hours.",
    },
    {
      q: 'Will these work on prop firms?',
      a: 'Many of our listed EAs are optimized for and fully compatible with prop firm rules (featuring specific settings for drawdown limits, daily cap protection, and news filters). We suggest verifying firm compatibility on the product details page.',
    },
    {
      q: 'Do you provide support?',
      a: 'We offer robust installation guides, preset files (.set), and setup instructions for all listed EAs. While we do not provide custom financial advice, our technical support desk is available via email and WhatsApp to troubleshoot configurations.',
    },
  ];

  return (
    <PageShell className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex gap-2 font-body text-xs text-vault-text-muted">
        <Link href="/" className="hover:text-vault-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-vault-text-secondary">How It Works</span>
      </nav>

      {/* Hero Section */}
      <Reveal as="section" className="relative overflow-hidden rounded-3xl border border-vault-border bg-gradient-to-b from-vault-surface to-vault-surface-low px-6 py-16 text-center sm:px-12 lg:py-24">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        {/* Glowing blobs */}
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-vault-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-vault-profit/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="rounded-full bg-vault-gold/10 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-vault-gold">
            EAVault Process
          </span>
          <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl lg:text-6xl">
            How EAVault Works
          </h1>
          <p className="mt-4 font-body text-base text-vault-text-secondary sm:text-lg leading-relaxed">
            Get premium MT4/MT5 Expert Advisors in minutes — with verified backtests and instant delivery.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <MagneticButton className="inline-flex">
              <Link
                href="/marketplace"
                className="rounded-xl bg-vault-gold px-8 py-4 font-heading text-sm font-bold text-vault-bg shadow-lg hover:opacity-90 active:scale-98 transition-all"
              >
                Browse Marketplace
              </Link>
            </MagneticButton>
            <MotionButton className="inline-flex">
              <Link
                href="/request-ea"
                className="rounded-xl border border-vault-border bg-vault-surface-high px-8 py-4 font-heading text-sm font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold active:scale-98 transition-all"
              >
                Request Any EA
              </Link>
            </MotionButton>
          </div>
        </div>
      </Reveal>

      {/* Step-by-Step Timeline Section */}
      <Reveal as="section" className="mt-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-vault-text sm:text-3xl">
            Your Path to Algorithmic Trading
          </h2>
          <p className="mt-2 font-body text-xs text-vault-text-secondary">
            A simple, secure, and instant journey from browsing to automated profits.
          </p>
        </div>

        {/* Timeline Desktop/Mobile */}
        <div className="relative mt-16">
          {/* Vertical connection line for mobile */}
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-vault-border md:hidden" />

          <StaggerReveal className="space-y-12 md:space-y-0 md:grid md:grid-cols-5 md:gap-6 lg:gap-8">
            {steps.map((step, idx) => (
              <RevealItem key={idx} className="relative flex md:flex-col gap-6 md:gap-0 group">
                {/* Timeline connector path for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute left-[calc(50%+24px)] top-[28px] right-[calc(-50%+24px)] h-0.5 bg-vault-border z-0 group-hover:bg-vault-gold/30 transition-colors" />
                )}

                {/* Step Circle/Icon */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-vault-border bg-vault-surface-high text-vault-text-secondary group-hover:border-vault-gold group-hover:text-vault-gold transition-colors duration-300">
                  {step.icon}
                  <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-vault-border text-[9px] font-heading font-extrabold text-vault-text-secondary border border-vault-surface group-hover:bg-vault-gold group-hover:text-vault-bg group-hover:border-vault-surface transition-colors duration-300">
                    {step.num}
                  </span>
                </div>

                {/* Step Text Details */}
                <div className="md:mt-6">
                  <h3 className="font-heading text-base font-bold text-vault-text group-hover:text-vault-gold transition-colors duration-300">
                    {step.title}
                  </h3>
                  <ul className="mt-3 space-y-2.5 font-body text-[11px] text-vault-text-secondary leading-relaxed list-none pl-0">
                    {step.desc.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex gap-2 items-start">
                        <span className="text-vault-gold shrink-0">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </StaggerReveal>
        </div>
      </Reveal>

      {/* Why Traders Choose Us Section */}
      <Reveal as="section" className="mt-24 rounded-3xl border border-vault-border bg-vault-surface px-6 py-16 sm:px-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-vault-text sm:text-3xl">
            Why Traders Choose EAVault
          </h2>
          <p className="mt-2 font-body text-xs text-vault-text-secondary leading-relaxed">
            We bridge the gap between expensive trading tools and everyday retail traders, offering unparalleled value.
          </p>
        </div>

        <StaggerReveal className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, idx) => (
            <RevealItem
              key={idx}
            >
              <MouseGlowCard className="group card-gradient-border card-hover-glow h-full border border-vault-border p-6 flex flex-col justify-between transition-all duration-300">
                <div>
                {feat.icon}
                <h3 className="mt-4 font-heading text-sm font-bold text-vault-text">
                  {feat.title}
                </h3>
                <p className="mt-2.5 font-body text-xs text-vault-text-secondary leading-relaxed">
                  {feat.desc}
                </p>
                </div>
              </MouseGlowCard>
            </RevealItem>
          ))}
        </StaggerReveal>
      </Reveal>

      {/* FAQ Accordion Section */}
      <Reveal as="section" className="mt-24 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-vault-text sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 font-body text-xs text-vault-text-secondary">
            Got questions about EAVault operations? Find quick answers below.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-vault-border bg-vault-surface overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-heading text-xs font-bold text-vault-text hover:text-vault-gold transition-colors duration-200"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vault-surface-high border border-vault-border text-vault-text-secondary transition-transform duration-300">
                    {isOpen ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-vault-border"
                    >
                      <p className="px-6 py-5 font-body text-[11px] text-vault-text-secondary leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Centered CTA Banner */}
      <Reveal as="section" className="mt-24 relative overflow-hidden rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface to-vault-surface-low px-6 py-16 text-center sm:px-12">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-vault-text sm:text-4xl">
            Ready to Start Automated Trading?
          </h2>
          <p className="mt-3 font-body text-xs text-vault-text-secondary">
            Browse our collection of verified MT4/MT5 Expert Advisors today.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <MagneticButton className="inline-flex">
              <Link
                href="/marketplace"
                className="rounded-xl bg-vault-gold px-8 py-3.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
              >
                Browse Marketplace
              </Link>
            </MagneticButton>
            <MotionButton className="inline-flex">
              <Link
                href="/request-ea"
                className="rounded-xl border border-vault-border bg-vault-surface-high px-8 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
              >
                Request an EA
              </Link>
            </MotionButton>
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}
