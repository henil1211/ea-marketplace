'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { EA } from '@/lib/stitch';

interface CategoryClientProps {
  eas: EA[];
}

export default function CategoryClient({ eas }: CategoryClientProps) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist state from localstorage
  useEffect(() => {
    const saved = localStorage.getItem('ea-wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const toggleWishlist = (id: string) => {
    let updated;
    if (wishlist.includes(id)) {
      updated = wishlist.filter((x) => x !== id);
    } else {
      updated = [...wishlist, id];
    }
    setWishlist(updated);
    localStorage.setItem('ea-wishlist', JSON.stringify(updated));
  };

  if (eas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-vault-border py-16 px-6 text-center">
        <span className="text-3xl">🤖</span>
        <h3 className="mt-4 font-heading text-lg font-bold text-vault-text">No Expert Advisors Found</h3>
        <p className="mt-1 font-body text-xs text-vault-text-secondary max-w-xs">
          We currently do not have active Expert Advisors listed under this specific selection. Check back soon for updates!
        </p>
        <Link
          href="/request-ea"
          className="mt-5 rounded-xl bg-vault-gold px-5 py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
        >
          Request an EA
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {eas.map((ea) => {
        const discount = calcDiscount(ea.mql5Price, ea.ourPrice);
        const isWished = wishlist.includes(ea.id!);

        // Win rate styling
        const rateColor = ea.winRate > 60 ? 'bg-vault-profit' : ea.winRate >= 40 ? 'bg-vault-gold-light' : 'bg-vault-loss';
        const rateTextColor = ea.winRate > 60 ? 'text-vault-profit' : ea.winRate >= 40 ? 'text-vault-gold-light' : 'text-vault-loss';

        // Platform badges
        const platformLabel = ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase();
        const platformBadgeStyle =
          ea.platform === 'mt4'
            ? 'bg-blue-500/10 text-blue-400'
            : ea.platform === 'mt5'
            ? 'bg-purple-500/10 text-purple-400'
            : 'bg-vault-gold/10 text-vault-gold';

        return (
          <div
            key={ea.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-vault-border bg-vault-surface p-4 transition-all duration-300 hover:border-vault-gold/20 hover:shadow-[0_0_30px_rgba(240,185,11,0.04)]"
          >
            {/* Thumbnail Graph */}
            <div className="relative mx-auto mb-4 h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-vault-surface-high to-vault-bg border border-vault-border/50">
              {ea.thumbnail && !ea.thumbnail.includes('placeholder') ? (
                <img src={ea.thumbnail} alt={ea.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 320 160" fill="none">
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

            {/* Title / Description */}
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
                    <span className="text-[9px] text-vault-text-muted">({ea.downloads || 430}+ downloads)</span>
                  </div>
                </div>
                <span className={`rounded px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${platformBadgeStyle}`}>
                  {platformLabel}
                </span>
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

            {/* Price section */}
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
          </div>
        );
      })}
    </div>
  );
}
