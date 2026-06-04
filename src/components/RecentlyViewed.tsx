'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MouseGlowCard } from '@/components/motion/MotionPrimitives';

export default function RecentlyViewed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const savedStr = localStorage.getItem('ea-recently-viewed');
        if (!savedStr) {
          setLoading(false);
          return;
        }

        const slugs: string[] = JSON.parse(savedStr);
        if (slugs.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all active EAs to filter the list
        const res = await fetch('/api/stitch/eas?status=active');
        if (res.ok) {
          const data = await res.json();
          const allEAs = Array.isArray(data) ? data : (data?.data || []);
          
          // Map and preserve the order of recently viewed
          const matched = slugs
            .map((slug) => allEAs.find((ea: any) => ea.slug === slug))
            .filter(Boolean);

          setItems(matched.slice(0, 4)); // Show top 4 recently viewed
        }
      } catch (err) {
        console.error('Error loading recently viewed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecentlyViewed();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-12 border-t border-vault-border">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold tracking-tight text-vault-text">
              Recently <span className="text-vault-gold">Viewed</span>
            </h3>
            <p className="mt-1 font-body text-[11px] text-vault-text-muted">
              Continue where you left off.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((ea) => {
            const discount = Math.round(
              ((ea.mql5Price - ea.ourPrice) / ea.mql5Price) * 100
            );
            const platformLabel = ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase();
            const platformBadgeStyle =
              ea.platform === 'both'
                ? 'bg-vault-gold/10 text-vault-gold'
                : ea.platform === 'mt4'
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-purple-500/10 text-purple-400';
            const rateTextColor =
              ea.winRate >= 80
                ? 'text-emerald-500'
                : ea.winRate >= 70
                ? 'text-vault-gold'
                : 'text-amber-500';
            const formatPrice = (price: number) => {
              return price === 0 ? 'Free' : `$${price}`;
            };

            return (
              <MouseGlowCard
                key={ea.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-vault-border bg-vault-surface p-4 transition-all duration-300 hover:border-vault-gold/20 hover:shadow-[0_0_30px_rgba(240,185,11,0.04)]"
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
                    {ea.downloads && ea.downloads > 400 ? (
                      <span className="rounded bg-emerald-500 px-1.5 py-0.5 font-heading text-[8px] font-extrabold uppercase tracking-wide text-white">
                        ⚡ Popular
                      </span>
                    ) : null}
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

                {/* Price and Details CTA */}
                <div className="mt-3.5 border-t border-vault-border/50 pt-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-vault-text-muted mb-0.5">Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-base font-bold text-vault-profit">
                        {formatPrice(ea.ourPrice)}
                      </span>
                      <span className="font-body text-[10px] text-vault-text-muted line-through">
                        {formatPrice(ea.mql5Price)}
                      </span>
                    </div>
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
      </div>
    </section>
  );
}
