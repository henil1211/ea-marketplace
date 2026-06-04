'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CATEGORIES, PLATFORMS } from '@/lib/constants';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { EA, Platform, EACategory } from '@/lib/stitch';
import RecentlyViewed from '@/components/RecentlyViewed';
import { useDebounce } from '@/lib/hooks';
import { MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';

// Sort Options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Listings' },
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'price-asc', label: 'Lowest Price' },
  { value: 'price-desc', label: 'Highest Price' },
  { value: 'savings', label: 'Biggest Savings' },
];

export default function MarketplacePage() {
  // DB State
  const [allEAs, setAllEAs] = useState<EA[]>([]);
  const [hidePublicPrices, setHidePublicPrices] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<EACategory[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minWinRate, setMinWinRate] = useState(50);
  const [sortBy, setSortBy] = useState('newest');

  // Wishlist state (local storage)
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Mobile Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load wishlist on mount
  useEffect(() => {
    const saved = localStorage.getItem('ea-wishlist');
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Fetch EAs and settings
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [easRes, settingsRes] = await Promise.all([
          fetch('/api/stitch/eas?status=active'),
          fetch('/api/stitch/settings')
        ]);
        if (easRes.ok) {
          const data = await easRes.json();
          const items = Array.isArray(data) ? data : (data?.data || []);
          setAllEAs(items);
        }
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const settingsList = Array.isArray(settings) ? settings : (settings?.data || []);
          if (settingsList.length > 0) {
            setHidePublicPrices(!!settingsList[0].hidePublicPrices);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Toggle Wishlist
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

  // Toggle Filters helper
  const handlePlatformChange = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
    setCurrentPage(1);
  };

  const handleCategoryChange = (c: EACategory) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setPlatforms([]);
    setCategories([]);
    setMinPrice(0);
    setMaxPrice(500);
    setMinWinRate(50);
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Process Filtering & Sorting
  const filteredEAs = useMemo(() => {
    let result = [...allEAs];

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

    // Platforms filter (If empty, show all. If chosen, match selected)
    if (platforms.length > 0) {
      result = result.filter((ea) => {
        // If EA supports both, it matches MT4 or MT5 filters
        if (ea.platform === 'both') return true;
        return platforms.includes(ea.platform);
      });
    }

    // Categories filter
    if (categories.length > 0) {
      result = result.filter((ea) => categories.includes(ea.category));
    }

    // Price range
    result = result.filter(
      (ea) => ea.ourPrice >= minPrice && ea.ourPrice <= maxPrice
    );

    // Min Win Rate
    result = result.filter((ea) => ea.winRate >= minWinRate);

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.ourPrice - b.ourPrice;
        case 'price-desc':
          return b.ourPrice - a.ourPrice;
        case 'savings':
          const saveA = a.mql5Price - a.ourPrice;
          const saveB = b.mql5Price - b.ourPrice;
          return saveB - saveA;
        case 'best-seller':
          // Sort by highest rating/popularity mock logic
          return (b.profitFactor || 0) - (a.profitFactor || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [allEAs, search, platforms, categories, minPrice, maxPrice, minWinRate, sortBy]);

  // Paginated List
  const paginatedEAs = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredEAs.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredEAs, currentPage]);

  const totalPages = Math.ceil(filteredEAs.length / itemsPerPage);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12">
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Expert Advisor <span className="text-vault-gold">Marketplace</span>
        </h1>
        <p className="mt-2 font-body text-vault-text-secondary">
          Access high-performance MT4 and MT5 EAs at 60-80% discounts. Fully backtested.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col gap-8 lg:flex-row">
        
        {/* ======================================= */}
        {/*  FILTER SIDEBAR (Desktop)               */}
        {/* ======================================= */}
        <aside className="hidden w-[280px] flex-shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-vault-border bg-vault-surface p-6">
            <div className="flex items-center justify-between border-b border-vault-border pb-4">
              <h2 className="font-heading text-lg font-semibold text-vault-text">Filters</h2>
              <button
                onClick={handleClearFilters}
                className="font-body text-xs font-semibold text-vault-gold hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="mt-6 space-y-6">
              {/* Platform */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Platform</h3>
                <div className="mt-3 space-y-2.5">
                  {PLATFORMS.map((p) => (
                    <label key={p.value} className="flex items-center gap-3 font-body text-sm text-vault-text-secondary cursor-pointer hover:text-vault-text">
                      <input
                        type="checkbox"
                        checked={platforms.includes(p.value as Platform)}
                        onChange={() => handlePlatformChange(p.value as Platform)}
                        className="h-4.5 w-4.5 rounded border-vault-border bg-vault-bg text-vault-gold focus:ring-0 accent-vault-gold"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Category</h3>
                <div className="mt-3 max-h-[180px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                  {CATEGORIES.map((c) => (
                    <label key={c.value} className="flex items-center gap-3 font-body text-sm text-vault-text-secondary cursor-pointer hover:text-vault-text">
                      <input
                        type="checkbox"
                        checked={categories.includes(c.value as EACategory)}
                        onChange={() => handleCategoryChange(c.value as EACategory)}
                        className="h-4.5 w-4.5 rounded border-vault-border bg-vault-bg text-vault-gold focus:ring-0 accent-vault-gold"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Dual Inputs */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Price Range</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1">
                    <span className="font-body text-[10px] text-vault-text-muted">Min ($)</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-lg border border-vault-border bg-vault-bg px-2 py-1.5 font-heading text-sm text-vault-text focus:border-vault-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-body text-[10px] text-vault-text-muted">Max ($)</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(500, parseInt(e.target.value) || 500))}
                      className="w-full rounded-lg border border-vault-border bg-vault-bg px-2 py-1.5 font-heading text-sm text-vault-text focus:border-vault-gold focus:outline-none"
                    />
                  </div>
                </div>
                {/* Standard range slider for max price */}
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="mt-3 w-full accent-vault-gold bg-vault-bg h-1 rounded-lg cursor-pointer"
                />
                <div className="mt-1.5 flex justify-between font-heading text-[10px] text-vault-text-muted">
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Min Win Rate Slider */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Min Win Rate</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-body text-xs text-vault-text-secondary">At least</span>
                  <span className="font-heading text-sm font-bold text-vault-profit">{minWinRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minWinRate}
                  onChange={(e) => setMinWinRate(parseInt(e.target.value))}
                  className="mt-2 w-full accent-vault-gold bg-vault-bg h-1 rounded-lg cursor-pointer"
                />
                <div className="mt-1.5 flex justify-between font-heading text-[10px] text-vault-text-muted">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ======================================= */}
        {/*  MAIN CONTENT AREA                      */}
        {/* ======================================= */}
        <div className="flex-1">
          {/* Controls Panel */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, category, tags..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search-input"
                className="w-full rounded-xl border border-vault-border bg-vault-surface px-11 py-3 font-body text-sm text-vault-text placeholder:text-vault-text-muted outline-none transition-colors focus:border-vault-gold"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-vault-text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21L16.65 16.65" strokeLinecap="round" />
              </svg>
            </div>

            {/* Mobile Filter Toggle & Sort Select */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-vault-border bg-vault-surface px-4 py-3 font-body text-sm text-vault-text lg:hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6H20M7 12H17M10 18H14" strokeLinecap="round" />
                </svg>
                Filters
              </button>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  id="sort-select"
                  className="w-full rounded-xl border border-vault-border bg-vault-surface py-3 pl-4 pr-10 font-body text-sm text-vault-text outline-none focus:border-vault-gold appearance-none cursor-pointer"
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
          </div>

          {/* Results Info */}
          <div className="mb-4 flex items-center justify-between font-body text-xs text-vault-text-muted">
            <p>Showing {filteredEAs.length} Expert Advisors</p>
            {filteredEAs.length > 0 && (
              <p>Page {currentPage} of {totalPages}</p>
            )}
          </div>

          {/* Skeletons Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[460px] animate-pulse rounded-2xl bg-vault-surface border border-vault-border" />
              ))}
            </div>
          ) : filteredEAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-vault-border py-20 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vault-surface-high text-vault-text-muted">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21L16.65 16.65" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold">No EAs Match Filters</h3>
              <p className="mt-2 max-w-sm font-body text-sm text-vault-text-secondary">
                We couldn&apos;t find any Expert Advisors matching your exact requirements.
              </p>
              <Link
                href="/request-ea"
                id="empty-state-cta"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-vault-gold px-6 py-3 font-heading text-sm font-bold text-vault-bg transition-transform hover:scale-105"
              >
                Request this EA
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedEAs.map((ea) => {
                const discount = calcDiscount(ea.mql5Price, ea.ourPrice);
                const isWished = wishlist.includes(ea.id!);

                // Win rate progress bar color
                const rateColor = ea.winRate > 60 ? 'bg-vault-profit' : ea.winRate >= 40 ? 'bg-vault-gold-light' : 'bg-vault-loss';
                const rateTextColor = ea.winRate > 60 ? 'text-vault-profit' : ea.winRate >= 40 ? 'text-vault-gold-light' : 'text-vault-loss';

                // Platform Badge Styling
                const platformLabel = ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase();
                const platformBadgeStyle =
                  ea.platform === 'mt4'
                    ? 'bg-blue-500/10 text-blue-400'
                    : ea.platform === 'mt5'
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'bg-vault-gold/10 text-vault-gold';

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
                );
              })}
            </div>
          )}

          {/* ======================================= */}
          {/*  PAGINATION CONTROLS                    */}
          {/* ======================================= */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-vault-text-muted transition-colors hover:border-vault-gold hover:text-vault-gold disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-10 w-10 rounded-lg font-heading text-sm font-semibold transition-all ${
                    currentPage === i + 1
                      ? 'bg-vault-gold text-vault-bg'
                      : 'border border-vault-border text-vault-text hover:border-vault-gold hover:text-vault-gold'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-vault-border text-vault-text-muted transition-colors hover:border-vault-gold hover:text-vault-gold disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 -mt-6 pb-12">
        <RecentlyViewed />
      </div>

      {/* ======================================= */}
      {/*  MOBILE DRAWER OVERLAY                  */}
      {/* ======================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Wrapper */}
          <div className="relative flex h-full w-[300px] flex-col bg-vault-surface p-6 border-l border-vault-border">
            <div className="flex items-center justify-between border-b border-vault-border pb-4">
              <h2 className="font-heading text-lg font-semibold text-vault-text">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-vault-text hover:text-vault-gold"
              >
                <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Sidebar content (scrollable) */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1 scrollbar-thin">
              {/* Platform */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Platform</h3>
                <div className="mt-3 space-y-2.5">
                  {PLATFORMS.map((p) => (
                    <label key={p.value} className="flex items-center gap-3 font-body text-sm text-vault-text-secondary cursor-pointer hover:text-vault-text">
                      <input
                        type="checkbox"
                        checked={platforms.includes(p.value as Platform)}
                        onChange={() => handlePlatformChange(p.value as Platform)}
                        className="h-4.5 w-4.5 rounded border-vault-border bg-vault-bg text-vault-gold focus:ring-0 accent-vault-gold"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Category</h3>
                <div className="mt-3 space-y-2.5">
                  {CATEGORIES.map((c) => (
                    <label key={c.value} className="flex items-center gap-3 font-body text-sm text-vault-text-secondary cursor-pointer hover:text-vault-text">
                      <input
                        type="checkbox"
                        checked={categories.includes(c.value as EACategory)}
                        onChange={() => handleCategoryChange(c.value as EACategory)}
                        className="h-4.5 w-4.5 rounded border-vault-border bg-vault-bg text-vault-gold focus:ring-0 accent-vault-gold"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Price Range</h3>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1">
                    <span className="font-body text-[10px] text-vault-text-muted">Min ($)</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-lg border border-vault-border bg-vault-bg px-2 py-1.5 font-heading text-sm text-vault-text focus:border-vault-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-body text-[10px] text-vault-text-muted">Max ($)</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.min(500, parseInt(e.target.value) || 500))}
                      className="w-full rounded-lg border border-vault-border bg-vault-bg px-2 py-1.5 font-heading text-sm text-vault-text focus:border-vault-gold focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="mt-3 w-full accent-vault-gold bg-vault-bg h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Win Rate */}
              <div>
                <h3 className="font-heading text-sm font-semibold text-vault-text">Min Win Rate</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-body text-xs text-vault-text-secondary">At least</span>
                  <span className="font-heading text-sm font-bold text-vault-profit">{minWinRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minWinRate}
                  onChange={(e) => setMinWinRate(parseInt(e.target.value))}
                  className="mt-2 w-full accent-vault-gold bg-vault-bg h-1 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Clear & Apply buttons in Drawer */}
            <div className="mt-auto border-t border-vault-border pt-4 flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 rounded-lg border border-vault-border py-2.5 font-body text-xs font-semibold text-vault-text hover:bg-vault-surface-high"
              >
                Clear
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-lg bg-vault-gold py-2.5 font-heading text-xs font-bold text-vault-bg hover:bg-vault-gold-light"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
