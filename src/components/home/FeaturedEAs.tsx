'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';

interface FeaturedEA {
  id: string;
  name: string;
  slug: string;
  platform: string;
  winRate: number;
  maxDrawdown?: number;
  mql5Price: number;
  ourPrice: number;
  category: string;
  thumbnail?: string;
  trending?: boolean;
  downloads?: number;
  profitFactor?: number;
}

const MOCK_EAS: FeaturedEA[] = [
  {
    id: '1', name: 'Gold Scalper Pro', slug: 'gold-scalper-pro', platform: 'mt5',
    winRate: 82.3, maxDrawdown: 6.2, mql5Price: 499, ourPrice: 99, category: 'scalper', profitFactor: 2.1
  },
  {
    id: '2', name: 'TrendMaster AI', slug: 'trendmaster-ai', platform: 'both',
    winRate: 76.8, maxDrawdown: 8.5, mql5Price: 349, ourPrice: 69, category: 'trend', profitFactor: 1.95
  },
  {
    id: '3', name: 'Grid Recovery FX', slug: 'grid-recovery-fx', platform: 'mt4',
    winRate: 71.5, maxDrawdown: 12.4, mql5Price: 599, ourPrice: 119, category: 'grid', profitFactor: 1.8
  },
  {
    id: '4', name: 'Breakout Ninja', slug: 'breakout-ninja', platform: 'mt5',
    winRate: 79.1, maxDrawdown: 7.8, mql5Price: 299, ourPrice: 59, category: 'breakout', profitFactor: 2.3
  },
  {
    id: '5', name: 'Hedge Shield Plus', slug: 'hedge-shield-plus', platform: 'both',
    winRate: 85.0, maxDrawdown: 5.5, mql5Price: 699, ourPrice: 139, category: 'hedging', profitFactor: 2.5
  },
  {
    id: '6', name: 'Swing Titan V3', slug: 'swing-titan-v3', platform: 'mt4',
    winRate: 73.2, maxDrawdown: 9.1, mql5Price: 449, ourPrice: 89, category: 'swing', profitFactor: 1.88
  },
];

function PlatformBadge({ platform }: { platform: string }) {
  const label = platform === 'both' ? 'MT4/MT5' : platform.toUpperCase();
  return (
    <span className="rounded-md bg-vault-gold/10 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-vault-gold">
      {label}
    </span>
  );
}

export default function FeaturedEAs() {
  const [eas, setEas] = useState<FeaturedEA[]>([]);
  const [hidePublicPrices, setHidePublicPrices] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [easRes, settingsRes] = await Promise.all([
          fetch('/api/stitch/eas?featured=true&status=active'),
          fetch('/api/stitch/settings')
        ]);
        if (easRes.ok) {
          const data = await easRes.json();
          const items = Array.isArray(data) ? data : (data?.data || []);
          setEas(items);
        }
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const settingsList = Array.isArray(settings) ? settings : (settings?.data || []);
          if (settingsList.length > 0) {
            setHidePublicPrices(!!settingsList[0].hidePublicPrices);
          }
        }
      } catch {
        // Fallback handled
      }
    }
    fetchData();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="featured-eas" className="py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Top-Rated{' '}
              <span className="text-vault-gold">Expert Advisors</span>
            </h2>
            <p className="mt-2 font-body text-vault-text-secondary">
              Hand-picked EAs with proven backtest results.
            </p>
          </div>

          {/* Scroll buttons */}
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll('left')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-vault-text-muted transition-colors hover:border-vault-gold hover:text-vault-gold"
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-vault-text-muted transition-colors hover:border-vault-gold hover:text-vault-gold"
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards Scroll */}
        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-2 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {eas.map((ea) => {
            const discount = Math.round(
              ((ea.mql5Price - ea.ourPrice) / ea.mql5Price) * 100
            );
            return (
              <MouseGlowCard
                key={ea.id}
                className="group min-w-[300px] max-w-[320px] flex-shrink-0 snap-start rounded-2xl border border-vault-border bg-vault-surface p-4 transition-all duration-300 hover:border-vault-gold/30 hover:shadow-[0_0_30px_rgba(240,185,11,0.06)]"
              >
                {/* Thumbnail Graph Decoration */}
                <div className="relative mx-auto mb-4 h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-vault-surface-high to-vault-bg border border-vault-border/40">
                  {/* Top Action Badges (inside image container) */}
                  <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
                    {ea.trending && (
                      <span className="rounded bg-rose-500 px-1.5 py-0.5 font-heading text-[8px] font-extrabold uppercase tracking-wide text-white">
                        🔥 Trending
                      </span>
                    )}
                  </div>

                  {ea.thumbnail && !ea.thumbnail.includes('placeholder') ? (
                    <img src={ea.thumbnail} alt={ea.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="absolute inset-0 h-full w-full opacity-15" viewBox="0 0 320 160" fill="none">
                        <path
                          d={`M0 ${140 - ea.winRate} Q40 80, 80 100 T160 ${120 - 15} T240 90 T320 40`}
                          stroke="#F0B90B"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading text-[10px] font-bold text-vault-text-muted tracking-wider uppercase bg-vault-surface-high/85 px-2.5 py-1 rounded-md border border-vault-border">
                          {ea.category} Strategy
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1">
                  {/* Brand Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-heading text-sm font-semibold text-vault-text group-hover:text-vault-gold transition-colors line-clamp-1">
                        {ea.name}
                      </h3>
                      {/* Stars & Reviews right below title */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center gap-0.5 text-vault-gold">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1.5L9.85 5.25L14 5.85L11 8.75L11.7 12.85L8 10.9L4.3 12.85L5 8.75L2 5.85L6.15 5.25L8 1.5Z" />
                          </svg>
                          <span className="font-heading text-[10px] font-semibold">4.8</span>
                        </div>
                        <span className="text-[9px] text-vault-text-muted">(18 reviews)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      <span className="rounded bg-vault-gold px-1 py-0.5 font-heading text-[7px] font-extrabold uppercase tracking-wide text-vault-bg">
                        ⭐
                      </span>
                      {ea.winRate >= 80 && (
                        <span className="rounded bg-blue-500 px-1 py-0.5 font-heading text-[7px] font-extrabold uppercase tracking-wide text-white">
                          Pro
                        </span>
                      )}
                      <PlatformBadge platform={ea.platform} />
                    </div>
                  </div>

                  {/* Key Stats Row */}
                  <div className="mt-3.5 flex items-center justify-between rounded-xl bg-vault-surface-high/60 border border-vault-border/30 px-3 py-2 text-xs font-semibold">
                    <div className="text-center flex-1">
                      <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Win Rate</span>
                      <span className="font-heading text-xs font-bold text-vault-profit">{ea.winRate}%</span>
                    </div>
                    <div className="h-5 w-[1px] bg-vault-border/50" />
                    <div className="text-center flex-1">
                      <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Drawdown</span>
                      <span className="font-heading text-xs font-bold text-vault-text">{ea.maxDrawdown !== undefined ? ea.maxDrawdown : 8.5}%</span>
                    </div>
                    <div className="h-5 w-[1px] bg-vault-border/50" />
                    <div className="text-center flex-1">
                      <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Profit Factor</span>
                      <span className="font-heading text-xs font-bold text-vault-text">{ea.profitFactor !== undefined ? ea.profitFactor : 2.1}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Details CTA */}
                <div className="mt-3.5 border-t border-vault-border/50 pt-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-vault-text-muted mb-0.5">Price</span>
                    {hidePublicPrices ? (
                      <span className="font-heading text-xs font-bold text-vault-gold">
                        Contact
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-base font-bold text-vault-profit">
                          ${ea.ourPrice}
                        </span>
                        <span className="font-body text-[10px] text-vault-text-muted line-through">
                          ${ea.mql5Price}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/marketplace/${ea.slug}`}
                    className="rounded-lg bg-vault-gold/10 px-3 py-1.5 font-heading text-xs font-bold text-vault-gold hover:bg-vault-gold hover:text-vault-bg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </MouseGlowCard>
            );
          })}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <Link
            href="/marketplace"
            id="featured-view-all"
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-vault-gold transition-opacity hover:opacity-80"
          >
            View All Expert Advisors
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
