'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { EA } from '@/lib/stitch';
import { MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';
import { StaggerReveal, RevealItem } from '@/components/motion/Reveal';

interface FeaturedClientProps {
  eas: EA[];
  hidePublicPrices: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Featured' },
  { value: 'winrate', label: 'Highest Win Rate' },
  { value: 'drawdown', label: 'Lowest Drawdown' },
  { value: 'price-asc', label: 'Lowest Price' },
  { value: 'price-desc', label: 'Highest Price' },
];

export default function FeaturedClient({ eas, hidePublicPrices }: FeaturedClientProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist on mount
  useEffect(() => {
    const saved = localStorage.getItem('ea-wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const filteredEAs = useMemo(() => {
    let result = eas.filter((ea) => ea.featured === true);

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (ea) =>
          ea.name.toLowerCase().includes(q) ||
          ea.shortDesc.toLowerCase().includes(q) ||
          ea.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'winrate':
          return b.winRate - a.winRate;
        case 'drawdown':
          return a.maxDrawdown - b.maxDrawdown;
        case 'price-asc':
          return a.ourPrice - b.ourPrice;
        case 'price-desc':
          return b.ourPrice - a.ourPrice;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [eas, search, sortBy]);

  return (
    <div className="space-y-8">
      {/* Controls Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-vault-border pb-6">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search featured systems..."
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

        {/* Sort Select */}
        <div className="relative flex-1 sm:flex-none max-w-xs">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-xl border border-vault-border bg-vault-surface py-3 pl-4 pr-10 font-body text-xs text-vault-text outline-none focus:border-vault-gold appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-vault-text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid displaying EAs */}
      {filteredEAs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-vault-border bg-vault-surface">
          <span className="text-3xl">🤖</span>
          <h3 className="mt-4 font-heading text-base font-bold text-vault-text">No featured EAs found</h3>
          <p className="mt-1 font-body text-xs text-vault-text-muted">Try modifying your search query.</p>
        </div>
      ) : (
        <StaggerReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEAs.map((ea) => {
            const discount = calcDiscount(ea.mql5Price, ea.ourPrice);
            const rateColor = ea.winRate > 60 ? 'bg-vault-profit' : ea.winRate >= 40 ? 'bg-vault-gold-light' : 'bg-vault-loss';
            const rateTextColor = ea.winRate > 60 ? 'text-vault-profit' : ea.winRate >= 40 ? 'text-vault-gold-light' : 'text-vault-loss';

            const platformLabel = ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase();
            const platformBadgeStyle =
              ea.platform === 'mt4'
                ? 'bg-blue-500/10 text-blue-400'
                : ea.platform === 'mt5'
                ? 'bg-purple-500/10 text-purple-400'
                : 'bg-vault-gold/10 text-vault-gold';

            return (
              <RevealItem key={ea.id}>
                <MouseGlowCard className="group relative flex flex-col justify-between rounded-2xl border border-vault-border bg-vault-surface p-4 transition-all duration-300 hover:border-vault-gold/20 hover:shadow-[0_0_30px_rgba(240,185,11,0.04)]">
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
                            d={`M0 ${140 - ea.winRate} Q40 80, 80 100 T160 ${120 - ea.maxDrawdown} T240 90 T320 40`}
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

                  {/* Info details */}
                  <div className="flex-1">
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
                        {ea.featured && (
                          <span className="rounded bg-vault-gold px-1 py-0.5 font-heading text-[7px] font-extrabold uppercase tracking-wide text-vault-bg">
                            ⭐
                          </span>
                        )}
                        {ea.profitFactor >= 2.0 && (
                          <span className="rounded bg-blue-500 px-1 py-0.5 font-heading text-[7px] font-extrabold uppercase tracking-wide text-white">
                            Pro
                          </span>
                        )}
                        <span className={`rounded px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-wider ${platformBadgeStyle}`}>
                          {platformLabel}
                        </span>
                      </div>
                    </div>

                    {/* Key Stats Row */}
                    <div className="mt-3.5 flex items-center justify-between rounded-xl bg-vault-surface-high/60 border border-vault-border/30 px-3 py-2 text-xs font-semibold">
                      <div className="text-center flex-1">
                        <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Win Rate</span>
                        <span className={`font-heading text-xs font-bold ${rateTextColor}`}>{ea.winRate}%</span>
                      </div>
                      <div className="h-5 w-[1px] bg-vault-border/50" />
                      <div className="text-center flex-1">
                        <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Drawdown</span>
                        <span className="font-heading text-xs font-bold text-vault-text">{ea.maxDrawdown}%</span>
                      </div>
                      <div className="h-5 w-[1px] bg-vault-border/50" />
                      <div className="text-center flex-1">
                        <span className="block text-[9px] text-vault-text-muted font-normal mb-0.5">Profit Factor</span>
                        <span className="font-heading text-xs font-bold text-vault-text">{ea.profitFactor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Details CTA */}
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
                            {formatPrice(ea.ourPrice)}
                          </span>
                          <span className="font-body text-[10px] text-vault-text-muted line-through">
                            {formatPrice(ea.mql5Price)}
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
              </RevealItem>
            );
          })}
        </StaggerReveal>
      )}
    </div>
  );
}
