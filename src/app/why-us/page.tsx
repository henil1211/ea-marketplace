'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageShell, Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MagneticButton, MouseGlowCard } from '@/components/motion/MotionPrimitives';

interface EAComparison {
  name: string;
  platform: string;
  mql5Price: number;
  ourPrice: number;
}

export default function WhyUsPage() {
  const [eaCount, setEaCount] = useState(3);

  const comparisons: EAComparison[] = [
    { name: 'Gold Scalper Pro', platform: 'MT4/MT5', mql5Price: 350, ourPrice: 49 },
    { name: 'Grid Master EA', platform: 'MT4', mql5Price: 280, ourPrice: 39 },
    { name: 'Trend Hunter Premium', platform: 'MT5', mql5Price: 199, ourPrice: 29 },
    { name: 'News Trader Alpha', platform: 'MT4/MT5', mql5Price: 450, ourPrice: 59 },
    { name: 'Hedge Core Sentinel', platform: 'MT5', mql5Price: 220, ourPrice: 35 },
    { name: 'Martingale Overlord', platform: 'MT4', mql5Price: 150, ourPrice: 19 }
  ];

  const totalMql5 = comparisons.reduce((sum, item) => sum + item.mql5Price, 0);
  const totalOur = comparisons.reduce((sum, item) => sum + item.ourPrice, 0);
  const totalSavings = totalMql5 - totalOur;

  // Average price definitions for calculator
  const AVG_MQL5_PRICE = 275;
  const AVG_OUR_PRICE = 39;
  const savingsPerEa = AVG_MQL5_PRICE - AVG_OUR_PRICE;
  const calculatedSavings = eaCount * savingsPerEa;

  return (
    <PageShell className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
      {/* ======================================= */}
      {/*  HERO SECTION                           */}
      {/* ======================================= */}
      <Reveal as="section" className="relative overflow-hidden rounded-3xl border border-vault-border bg-gradient-to-br from-vault-surface-high via-vault-bg to-vault-surface p-8 text-center sm:py-16 md:px-12">
        <div className="absolute inset-0 bg-chart-grid opacity-10" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="rounded-full bg-vault-gold/10 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-vault-gold">
            The Value Proposition
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            Why Pay Full Price on <span className="text-vault-gold">MQL5?</span>
          </h1>
          <p className="mt-4 font-body text-base text-vault-text-secondary leading-relaxed sm:text-lg">
            We offer the exact same top-rated EAs at a fraction of the cost. Same features. Same version. Same performance. Zero compromise.
          </p>
        </div>
      </Reveal>

      {/* ======================================= */}
      {/*  COMPARISON TABLE                       */}
      {/* ======================================= */}
      <Reveal as="section" className="mt-16 space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="font-heading text-2xl font-bold text-vault-text">
            Direct Price Comparison
          </h2>
          <p className="mt-1 font-body text-xs text-vault-text-muted">
            See the exact price difference for some of the most popular Expert Advisors.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-vault-border bg-vault-surface">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vault-border bg-vault-bg/60 font-heading text-xs font-bold text-vault-text-secondary uppercase">
                <th className="p-4 sm:p-5">EA Name</th>
                <th className="p-4 sm:p-5">Platform</th>
                <th className="p-4 sm:p-5">MQL5 Store Price</th>
                <th className="p-4 sm:p-5 text-vault-gold">Vault Price</th>
                <th className="p-4 sm:p-5 text-vault-profit">Your Direct Savings</th>
              </tr>
            </thead>
            <tbody className="font-body text-sm text-vault-text-secondary">
              {comparisons.map((item, idx) => {
                const saving = item.mql5Price - item.ourPrice;
                return (
                  <tr key={idx} className="border-b border-vault-border last:border-none hover:bg-vault-surface-high/30 transition-colors">
                    <td className="p-4 sm:p-5 font-heading font-semibold text-vault-text">{item.name}</td>
                    <td className="p-4 sm:p-5">
                      <span className="rounded bg-vault-bg px-2.5 py-1 text-xs border border-vault-border text-vault-text-secondary">
                        {item.platform}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 line-through text-vault-text-muted">${item.mql5Price}</td>
                    <td className="p-4 sm:p-5 font-heading font-bold text-vault-gold">${item.ourPrice}</td>
                    <td className="p-4 sm:p-5 font-heading font-bold text-vault-profit">
                      Save ${saving} ({Math.round((saving / item.mql5Price) * 100)}% OFF)
                    </td>
                  </tr>
                );
              })}
              {/* TOTAL SAVINGS ROW */}
              <tr className="bg-vault-gold/5 font-heading font-bold text-vault-text border-t-2 border-vault-border">
                <td className="p-4 sm:p-5">TOTAL COST (All 6 EAs)</td>
                <td className="p-4 sm:p-5"></td>
                <td className="p-4 sm:p-5 text-vault-text-muted line-through">${totalMql5}</td>
                <td className="p-4 sm:p-5 text-vault-gold">${totalOur}</td>
                <td className="p-4 sm:p-5 text-vault-profit font-extrabold text-base">
                  Save ${totalSavings} ({Math.round((totalSavings / totalMql5) * 100)}% OFF)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* ======================================= */}
      {/*  SAVINGS CALCULATOR                     */}
      {/* ======================================= */}
      <Reveal as="section" className="mt-16 rounded-3xl border border-vault-border bg-vault-surface p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-heading text-2xl font-bold text-vault-text">
              Savings Calculator
            </h2>
            <p className="font-body text-sm text-vault-text-secondary leading-relaxed">
              Plan on diversifying your automated trading desk? Use the slider below to calculate how much trading capital you keep in your brokerage account by shopping with Vault.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between font-heading text-xs font-semibold text-vault-text">
                <span>Number of EAs planned:</span>
                <span className="text-vault-gold text-sm">{eaCount} {eaCount === 1 ? 'EA' : 'EAs'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={eaCount}
                onChange={(e) => setEaCount(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg bg-vault-bg accent-vault-gold appearance-none cursor-pointer border border-vault-border"
              />
              <div className="flex justify-between font-body text-[10px] text-vault-text-muted">
                <span>1 EA</span>
                <span>5 EAs</span>
                <span>10 EAs</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-vault-bg border border-vault-border p-6 text-center">
            <p className="font-body text-xs text-vault-text-muted uppercase tracking-wider">
              Total Savings Summary
            </p>
            <p className="mt-4 font-heading text-3xl sm:text-4xl font-extrabold text-vault-profit">
              ${calculatedSavings.toLocaleString()}
            </p>
            <p className="mt-2 font-body text-xs text-vault-text-secondary">
              Buying <span className="text-vault-gold font-bold">{eaCount}</span> EAs from us saves you <span className="text-vault-profit font-bold">${calculatedSavings.toLocaleString()}</span> vs buying on MQL5.
            </p>
            <div className="mt-4 text-[10px] font-body text-vault-text-muted">
              (Calculated using an average MQL5 price of ${AVG_MQL5_PRICE} vs our price of ${AVG_OUR_PRICE})
            </div>
          </div>
        </div>
      </Reveal>

      {/* ======================================= */}
      {/*  TRUST BULLETS                          */}
      {/* ======================================= */}
      <Reveal as="section" className="mt-16 space-y-8">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-vault-text">
            Same EA. Same Version. Just Cheaper.
          </h2>
          <p className="mt-2 max-w-xl mx-auto font-body text-sm text-vault-text-secondary leading-relaxed">
            Our files are the official unlocked packages exported directly from MT4/MT5 strategy platforms. We guarantee total fidelity.
          </p>
        </div>

        <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: 'Instant Digital Delivery',
              desc: 'Immediately after verifying payment, download files and optimal preset setfiles directly from your accounts console or your inbox.',
              icon: '⚡'
            },
            {
              title: 'Lifetime Free Access',
              desc: 'Pay once. Enjoy lifetime updates and setfile downloads for free. We continuously sync with the latest author updates.',
              icon: '🔄'
            },
            {
              title: 'All Backtests Verified',
              desc: 'Every EA is fully loaded with strategy tester equity charts, drawdown records, and optimized parameters to protect your capital.',
              icon: '📊'
            }
          ].map((item, idx) => (
            <RevealItem key={idx}>
              <MouseGlowCard className="group h-full rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-3">
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-heading text-base font-bold text-vault-text">{item.title}</h3>
              <p className="font-body text-xs text-vault-text-secondary leading-relaxed">{item.desc}</p>
              </MouseGlowCard>
            </RevealItem>
          ))}
        </StaggerReveal>
      </Reveal>

      {/* ======================================= */}
      {/*  CTA SECTION                            */}
      {/* ======================================= */}
      <Reveal as="section" className="mt-20 text-center">
        <MagneticButton className="inline-flex">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-vault-gold px-8 py-4 font-heading text-sm font-bold text-vault-bg transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(240,185,11,0.15)]"
          >
            Browse Our EA Collection
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </MagneticButton>
      </Reveal>
    </PageShell>
  );
}
