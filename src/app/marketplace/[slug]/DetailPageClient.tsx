'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { EA } from '@/lib/stitch';
import RecentlyViewed from '@/components/RecentlyViewed';
import { MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';

// Helper to parse line content and apply bold to markdown and separators
function parseLineContent(text: string) {
  if (!text) return '';

  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
  
  return parts.map((part, idx) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={idx} className="font-bold text-vault-text">{part.slice(2, -2)}</strong>;
    }

    const boldPrefixRegex = /^([A-Za-z0-9\s\&\+\/\(\)\.\,]+)(?:\s*—\s*|\s*-\s+|\s*:\s+)(.*)$/;
    const match = part.match(boldPrefixRegex);
    if (match) {
      const [, prefix, rest] = match;
      if (prefix.length < 40) {
        const separator = part.includes('—') ? ' — ' : part.includes(':') ? ': ' : ' - ';
        return (
          <span key={idx}>
            <strong className="font-bold text-vault-text">{prefix}</strong>
            {separator}
            {rest}
          </span>
        );
      }
    }

    return part;
  });
}

function FormattedDescription({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const parsedElements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = (key: string | number) => {
    if (currentListItems.length > 0) {
      parsedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 space-y-2 my-4 text-vault-text-secondary">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="font-body text-xs sm:text-sm leading-relaxed">
              {parseLineContent(item)}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flushList(i);
      continue;
    }

    const isHeading = 
      line.startsWith('#') || 
      line.startsWith('DISCLAIMER:') ||
      (line.length < 80 && !line.endsWith('.') && (
        line.toLowerCase().includes('ever created') ||
        line.toLowerCase().includes('how i work') ||
        line.toLowerCase().includes('minimum requirements') ||
        line.toLowerCase().includes('designed for') ||
        line.toLowerCase().startsWith('recommended brokers') ||
        line.toLowerCase().startsWith('why ')
      ));

    if (isHeading) {
      flushList(i);
      const headingText = line.replace(/^#+\s*/, '');
      parsedElements.push(
        <h4 key={`heading-${i}`} className="font-heading text-sm sm:text-base font-bold text-vault-gold mt-6 mb-3 first:mt-0">
          {headingText}
        </h4>
      );
      continue;
    }

    const isListItem = 
      line.startsWith('•') || 
      line.startsWith('-') || 
      line.startsWith('*') ||
      /^\d+[\s\+]/.test(line) ||
      line.startsWith('Plug & Play') || 
      line.startsWith('No complicated') || 
      line.startsWith('Multi-timeframe') || 
      line.startsWith('24/5 market') ||
      line.startsWith('Recommended brokers') ||
      line.startsWith('2 decimal price') ||
      line.startsWith('Minimum initial') ||
      line.startsWith('Recommended initial') ||
      line.startsWith('Leverage at least') ||
      line.startsWith('Account type') ||
      line.startsWith('Use a VPS') ||
      (currentListItems.length > 0 && line.length < 150);

    if (isListItem) {
      const cleanedLine = line
        .replace(/^[•\-\*\s]+/, '')
        .replace(/^Recommended brokers:\s*/i, 'Recommended brokers: ');
      currentListItems.push(cleanedLine);
    } else {
      flushList(i);
      parsedElements.push(
        <p key={`p-${i}`} className="font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed mb-4">
          {parseLineContent(line)}
        </p>
      );
    }
  }
  flushList('end');

  return <div className="space-y-4">{parsedElements}</div>;
}

interface DetailPageClientProps {
  ea: EA;
  related: EA[];
}

export default function DetailPageClient({ ea, related }: DetailPageClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'backtests' | 'reviews' | 'faq'>('overview');
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true });
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpen((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // User and Review states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // WhatsApp & Pricing mode settings state
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hidePublicPrices, setHidePublicPrices] = useState(false);

  const groupedReturns = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    const monthMap: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
      '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun',
      '7': 'Jul', '8': 'Aug', '9': 'Sep'
    };

    (ea.monthlyReturns || []).forEach((r: any) => {
      const parts = r.month.split('-');
      if (parts.length >= 2) {
        const year = parts[0];
        let month = parts[1];
        if (monthMap[month]) {
          month = monthMap[month];
        } else {
          month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
        }
        if (!groups[year]) groups[year] = {};
        groups[year][month] = r.returnPct !== undefined ? r.returnPct : r.return;
      }
    });
    return groups;
  }, [ea.monthlyReturns]);

  const handlePurchaseClick = async (source: string) => {
    // 1. Log lead in DB
    const leadData = {
      eaId: ea.id,
      eaName: ea.name,
      userId: currentUser?.id || '',
      customerName: currentUser?.name || 'Guest User',
      customerEmail: currentUser?.email || 'guest_guest@example.com',
      source,
      status: 'new' as const,
      notes: `User clicked purchase CTA via ${source}. Price mode hidden: ${hidePublicPrices ? 'Yes' : 'No'}.`
    };

    try {
      await fetch('/api/stitch/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
    } catch (err) {
      console.error('Error logging lead:', err);
    }

    // 2. Open WhatsApp Web/App redirect in a new tab
    const formattedPhone = whatsappNumber.replace(/[^0-9]/g, '');
    const priceText = hidePublicPrices ? 'Contact for Best Price' : `$${ea.ourPrice}`;
    const message = `Hello, I'm interested in purchasing the EA: ${ea.name}
Platform: ${ea.platform.toUpperCase()}
Price: ${priceText}
Please share availability, setup details, and payment instructions.`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Leave Review Form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Track recently viewed EA in local storage
  useEffect(() => {
    if (!ea.slug) return;
    try {
      const savedStr = localStorage.getItem('ea-recently-viewed');
      let slugs: string[] = savedStr ? JSON.parse(savedStr) : [];
      slugs = slugs.filter((s) => s !== ea.slug);
      slugs.unshift(ea.slug);
      localStorage.setItem('ea-recently-viewed', JSON.stringify(slugs.slice(0, 8)));
    } catch (err) {
      console.error('Error tracking recently viewed:', err);
    }
  }, [ea.slug]);

  // Load reviews and user info on mount
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/stitch/reviews?eaId=${ea.id}&approved=true`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.data || []);
        setReviews(items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load site settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch(`/api/stitch/settings?t=${Date.now()}`);
        if (res.ok) {
          const list = await res.json();
          const items = Array.isArray(list) ? list : (list?.data || []);
          if (items.length > 0) {
            const item = items[0];
            setWhatsappNumber(item.whatsapp || '');
            setHidePublicPrices(!!item.hidePublicPrices);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    fetchReviews();

    async function checkUserStatus() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          const user = meData.user;
          setCurrentUser(user);

          // Check wishlist
          const wishRes = await fetch(`/api/stitch/wishlists?userId=${user.id}&eaId=${ea.id}`);
          if (wishRes.ok) {
            const list = await wishRes.json();
            const items = Array.isArray(list) ? list : (list?.data || []);
            if (items.length > 0) {
              setWishlisted(true);
              setWishlistId(items[0].id);
            }
          }

          // Check purchase of this EA to enable review writing
          const ordersRes = await fetch(`/api/stitch/orders?userId=${user.id}&status=completed`);
          if (ordersRes.ok) {
            const orders = await ordersRes.json();
            const ordersList = Array.isArray(orders) ? orders : (orders?.data || []);
            const purchased = ordersList.some((order: any) => 
              order.eaId === ea.id || (order.eas && order.eas.some((e: any) => e.id === ea.id))
            );
            setHasPurchased(purchased);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (ea.id) {
      checkUserStatus();
    }
  }, [ea.id]);

  // Toggle wishlist using DB backend
  const handleWishlistToggle = async () => {
    if (!currentUser) {
      // Redirect or force login
      window.location.href = '/login';
      return;
    }

    try {
      if (wishlisted && wishlistId) {
        const res = await fetch(`/api/stitch/wishlists/${wishlistId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setWishlisted(false);
          setWishlistId(null);
          window.dispatchEvent(new Event('wishlist-updated'));
        }
      } else {
        const res = await fetch('/api/stitch/wishlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            eaId: ea.id,
            createdAt: new Date().toISOString(),
          }),
        });
        if (res.ok) {
          const item = await res.json();
          setWishlisted(true);
          setWishlistId(item.id);
          window.dispatchEvent(new Event('wishlist-updated'));

          // Trigger notification
          await fetch('/api/stitch/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              title: 'Wishlist Updated',
              message: `You added ${ea.name} to your wishlist.`,
              type: 'wishlist_sale',
              read: false,
              createdAt: new Date().toISOString(),
            }),
          });
          window.dispatchEvent(new Event('notifications-updated'));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Review submission
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reviewComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    try {
      const countries = ['US', 'GB', 'DE', 'ZA', 'SG', 'MY', 'AU', 'FR', 'CA', 'BR'];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];

      const payload = {
        eaId: ea.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userCountry: randomCountry,
        rating: reviewRating,
        comment: reviewComment,
        approved: false, // Moderated by default
        verifiedPurchase: hasPurchased,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/stitch/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit your review');
      }

      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      setReviewError(err.message || 'Something went wrong.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Memoized stats & calculations
  const reviewsStats = useMemo(() => {
    if (reviews.length === 0) {
      return { avg: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / count).toFixed(1));
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rate = Math.min(5, Math.max(1, Math.round(r.rating))) as 5 | 4 | 3 | 2 | 1;
      breakdown[rate] = (breakdown[rate] || 0) + 1;
    });
    return { avg, count, breakdown };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });
  }, [reviews, sortBy]);

  const discountAmount = ea.mql5Price - ea.ourPrice;
  const discountPct = calcDiscount(ea.mql5Price, ea.ourPrice);
  const platformLabel = ea.platform === 'both' ? 'MT4 & MT5' : ea.platform.toUpperCase();

  const riskStyles = {
    conservative: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    balanced: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    aggressive: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-12">
      {/* Breadcrumbs (Structured links) */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-body text-xs text-vault-text-muted">
        <Link href="/" className="hover:text-vault-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-vault-gold transition-colors">Marketplace</Link>
        <span>/</span>
        <Link href={`/category/${ea.category === 'scalper' ? 'scalping' : ea.category}`} className="hover:text-vault-gold transition-colors capitalize">
          {ea.category === 'scalper' ? 'scalping' : ea.category}
        </Link>
        <span>/</span>
        <span className="text-vault-text-secondary font-semibold">{ea.name}</span>
      </nav>


      {/* Top specifications header */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Large graphic visualization block */}
        <div className="lg:col-span-7">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-vault-border bg-gradient-to-br from-vault-surface-high to-vault-bg">
            <div className="absolute inset-0 bg-chart-grid opacity-15" />
            
            {ea.thumbnail && !ea.thumbnail.includes('placeholder') ? (
              <img
                src={ea.thumbnail}
                alt={ea.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-chart-grid opacity-15" />
                
                {/* Visual graph line */}
                <svg className="absolute inset-x-0 bottom-10 h-56 w-full opacity-35" viewBox="0 0 600 200" fill="none">
                  <path
                    d="M0 160 Q100 80, 200 120 T400 60 T600 30"
                    stroke="#F0B90B"
                    strokeWidth="4.5"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M0 180 Q100 100, 200 140 T400 90 T600 65"
                    stroke="#00C087"
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>
     
                {/* Logo watermark */}
                <div className="relative z-10 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-vault-gold/15 border border-vault-gold/25 text-vault-gold mb-4">
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
                      <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" stroke="#F0B90B" />
                    </svg>
                  </div>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-vault-text">
                    {ea.name}
                  </h2>
                </div>
     
                {/* Badges block on image */}
                <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                  <span className="rounded bg-vault-gold px-2.5 py-1 font-heading text-[10px] font-extrabold uppercase tracking-wider text-vault-bg">
                    Verified System
                  </span>
                  {ea.trending && (
                    <span className="rounded bg-vault-profit/20 border border-vault-profit/30 px-2.5 py-1 font-heading text-[10px] font-bold text-vault-profit uppercase tracking-wider">
                      🔥 Trending EA
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Text information side panel */}
        <div className="flex flex-col lg:col-span-5 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-2.5 py-1 font-heading text-xs font-bold uppercase tracking-wider ${
                ea.platform === 'mt4'
                  ? 'bg-blue-500/10 text-blue-400'
                  : ea.platform === 'mt5'
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-vault-gold/10 text-vault-gold'
              }`}>
                {ea.platform === 'both' ? 'MT4/MT5' : ea.platform.toUpperCase()}
              </span>
              <span className="rounded bg-vault-surface-high border border-vault-border px-2.5 py-1 font-body text-xs text-vault-text-secondary capitalize">
                {ea.category === 'scalper' ? 'scalping' : ea.category}
              </span>
              {ea.featured && (
                <span className="rounded bg-vault-gold px-2.5 py-1 font-heading text-xs font-extrabold uppercase tracking-wide text-vault-bg">
                  ⭐ Featured
                </span>
              )}
              {ea.profitFactor >= 2.0 && (
                <span className="rounded bg-blue-500 px-2.5 py-1 font-heading text-xs font-extrabold uppercase tracking-wide text-white">
                  🏆 Pro
                </span>
              )}
              <div className="flex items-center gap-1 font-body text-xs text-vault-text-secondary bg-vault-surface px-2 py-0.5 rounded border border-vault-border">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="#F0B90B">
                  <path d="M8 1.5L9.85 5.25L14 5.85L11 8.75L11.7 12.85L8 10.9L4.3 12.85L5 8.75L2 5.85L6.15 5.25L8 1.5Z" />
                </svg>
                <span className="font-heading font-bold text-vault-text">{reviewsStats.avg}</span>
                <span className="text-vault-text-muted">({reviewsStats.count} {reviewsStats.count === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-vault-text sm:text-4xl">
              {ea.name}
            </h1>

            {/* Extra Specifications Badge parameters */}
            {ea.propFirmCompatible && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-vault-profit/20 bg-vault-profit/5 px-3 py-1 font-body text-[11px] font-semibold text-vault-profit">
                  🛡️ Prop Firm Passed
                </span>
              </div>
            )}

            <p className="mt-4 font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed">
              {ea.shortDesc}
            </p>

            {/* Pricing calculations */}
            {hidePublicPrices ? (
              <div className="mt-6 rounded-2xl border border-vault-border bg-vault-surface/40 p-5 text-center">
                <span className="font-heading text-lg font-bold text-vault-gold block">
                  Special Pricing Options Available
                </span>
                <span className="font-body text-xs text-vault-text-secondary mt-1 block">
                  We offer customized pricing options depending on your trading platform, broker, and setup requirements.
                </span>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-vault-border bg-vault-surface/40 p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-body text-xs text-vault-text-muted line-through">
                    MQL5 Price: {formatPrice(ea.mql5Price)}
                  </span>
                  <span className="font-heading text-3xl font-extrabold text-vault-profit">
                    {formatPrice(ea.ourPrice)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded bg-vault-profit/15 px-3 py-1 font-heading text-xs font-bold text-vault-profit">
                    You Save {formatPrice(discountAmount)} ({discountPct}% OFF)
                  </span>
                  <span className="font-body text-[10px] text-vault-text-muted">
                    Last updated: {ea.lastUpdated || '2026-05'}
                  </span>
                </div>
              </div>
            )}

            {/* Guaranteed checkmarks */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-vault-border bg-vault-surface px-4 py-2.5 font-body text-xs text-vault-text">
                <span className="text-vault-profit font-bold">✓</span>
                Instant Digital Delivery
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-vault-border bg-vault-surface px-4 py-2.5 font-body text-xs text-vault-text">
                <span className="text-vault-profit font-bold">✓</span>
                Lifetime Free Updates
              </div>
            </div>
          </div>

          {/* Action trigger buy buttons */}
          <div className="mt-8">
            <button
              onClick={() => handlePurchaseClick('buy-btn-top')}
              className="w-full rounded-xl bg-vault-gold py-4 text-center font-heading text-sm font-bold text-vault-bg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              id="buy-btn-top"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
              </svg>
              Get This EA — Setup on WhatsApp
            </button>
          </div>

          {/* Trust first manual configuration flow info */}
          <div className="mt-6 rounded-xl border border-vault-border bg-vault-bg/60 p-4 font-body text-xs text-vault-text-secondary leading-relaxed space-y-2">
            <p className="font-heading font-bold text-vault-text flex items-center gap-1.5 text-vault-gold">
              💼 Why We Coordinate Setup Individually
            </p>
            <p>
              To ensure peak performance and prevent unnecessary capital exposure, EAVault coordinators manually verify your broker compatibility (spread/execution checks) and provide tailor-made set configuration files before you deploy any EA to a live trading terminal.
            </p>
          </div>
        </div>
      </section>

      {/* Specifications details with custom tabs */}
      <section className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          
          {/* Custom navigation tabs */}
          <div className="grid grid-cols-2 gap-2 pb-4 sm:pb-0 sm:gap-0 sm:flex sm:flex-row sm:border-b border-vault-border">
            {(['overview', 'backtests', 'reviews', 'faq'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-center px-4 py-3 sm:px-6 sm:py-4 font-heading text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap cursor-pointer border rounded-xl sm:rounded-none sm:border-0 sm:border-b-2 ${
                  activeTab === tab
                    ? 'bg-vault-gold/10 text-vault-gold border-vault-gold/40 sm:bg-transparent sm:border-vault-gold'
                    : 'bg-vault-surface/40 text-vault-text-muted hover:text-vault-text border-vault-border/50 sm:bg-transparent sm:border-transparent'
                }`}
              >
                {tab === 'backtests' ? 'Backtest Results' : tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="font-heading text-lg font-bold text-vault-text mb-3">Product Description</h3>
                  <div className="font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed">
                    {ea.fullDesc ? (
                      <FormattedDescription text={ea.fullDesc} />
                    ) : (
                      <p>Our professional automated trading system incorporates advanced neural analysis to read market structure changes in real-time. By tracking key order blocks and volume spikes, the system makes clean entries with tight stop-losses.</p>
                    )}
                  </div>
                </div>

                {/* What's included block */}
                <div className="rounded-2xl border border-vault-border bg-vault-surface p-6">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-vault-text mb-4">What&apos;s Included In Your Package:</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { title: 'Robot File', desc: `${ea.platform === 'mt4' ? '.ex4 file' : ea.platform === 'mt5' ? '.ex5 file' : '.ex4 & .ex5 files'}` },
                      { title: 'Presets File', desc: 'Optimized .set files' },
                      { title: 'Setup Guide', desc: 'Step-by-step video instructions' },
                      { title: 'Updates', desc: 'Lifetime free updates' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center rounded-xl bg-vault-bg p-3 border border-vault-border">
                        <p className="font-heading text-xs font-bold text-vault-gold">{item.title}</p>
                        <p className="mt-1 font-body text-[10px] text-vault-text-muted">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BACKTEST RESULTS */}
            {activeTab === 'backtests' && (
              <div className="space-y-8 animate-fade-in">
                {/* Real Backtest Screenshots */}
                {((ea.backtestImages && ea.backtestImages.length > 0) || ea.backtestImage) && (
                  <div className="space-y-4">
                    <h3 className="font-heading text-sm font-bold text-vault-text">Verified Strategy Tester Reports</h3>
                    <div className="flex flex-col gap-6">
                      {ea.backtestImages && ea.backtestImages.length > 0 ? (
                        ea.backtestImages.map((imgUrl: string, idx: number) => (
                          <div 
                            key={idx} 
                            onClick={() => setActiveLightboxImg(imgUrl)}
                            className="relative rounded-2xl border border-vault-border bg-vault-surface overflow-hidden group/bt cursor-zoom-in shadow-lg transition-all duration-300 hover:border-vault-gold/40 hover:shadow-[0_0_30px_rgba(240,185,11,0.04)]"
                          >
                            <img
                              src={imgUrl}
                              alt={`${ea.name} Backtest Screenshot ${idx + 1}`}
                              className="w-full h-auto object-contain transition-transform duration-300 group-hover/bt:scale-[1.01]"
                            />
                            <div className="absolute left-4 bottom-4 rounded bg-vault-bg/95 backdrop-blur-sm border border-vault-border px-3 py-1.5 font-heading text-[10px] font-bold text-vault-gold">
                              Screenshot #{idx + 1} (Click to Zoom)
                            </div>
                          </div>
                        ))
                      ) : ea.backtestImage ? (
                        <div 
                          onClick={() => setActiveLightboxImg(ea.backtestImage || null)}
                          className="relative rounded-2xl border border-vault-border bg-vault-surface overflow-hidden group/bt cursor-zoom-in shadow-lg transition-all duration-300 hover:border-vault-gold/40 hover:shadow-[0_0_30px_rgba(240,185,11,0.04)]"
                        >
                          <img
                            src={ea.backtestImage}
                            alt={`${ea.name} Backtest Screenshot`}
                            className="w-full h-auto object-contain transition-transform duration-300 group-hover/bt:scale-[1.01]"
                          />
                          <div className="absolute left-4 bottom-4 rounded bg-vault-bg/95 backdrop-blur-sm border border-vault-border px-3 py-1.5 font-heading text-[10px] font-bold text-vault-gold">
                            Strategy Tester Report Screenshot (Click to Zoom)
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                {!((ea.backtestImages && ea.backtestImages.length > 0) || ea.backtestImage) && (
                  <div className="text-center py-10 rounded-xl border border-dashed border-vault-border bg-vault-surface">
                    <p className="font-body text-xs text-vault-text-muted">No verified backtest screenshots or strategy tester reports are available for this Expert Advisor yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats Header */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-center rounded-2xl border border-vault-border bg-vault-surface p-6">
                  <div className="text-center sm:border-r border-vault-border">
                    <p className="font-heading text-5xl font-extrabold text-vault-text">{reviewsStats.avg}</p>
                    <p className="font-body text-xs text-vault-text-muted mt-1">out of 5 stars</p>
                    <div className="flex justify-center gap-0.5 mt-2">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < Math.round(reviewsStats.avg);
                        return (
                          <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={filled ? '#F0B90B' : '#475569'}>
                            <path d="M8 1.5L9.85 5.25L14 5.85L11 8.75L11.7 12.85L8 10.9L4.3 12.85L5 8.75L2 5.85L6.15 5.25L8 1.5Z" />
                          </svg>
                        );
                      })}
                    </div>
                    <p className="mt-2 font-body text-[11px] text-vault-text-muted">
                      Based on {reviewsStats.count} {reviewsStats.count === 1 ? 'verified review' : 'verified reviews'}
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-2.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsStats.breakdown[stars as 5|4|3|2|1] || 0;
                      const pct = reviewsStats.count > 0 ? Math.round((count / reviewsStats.count) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3 font-body text-xs text-vault-text-secondary">
                          <span className="w-12 text-left font-semibold">{stars} Star</span>
                          <div className="flex-1 h-2 rounded-full bg-vault-bg overflow-hidden border border-vault-border">
                            <div className="h-full bg-vault-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-vault-text-muted">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Toolbar for Reviews (Sort & count) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-vault-border pb-4">
                  <h3 className="font-heading text-base font-bold text-vault-text">
                    Customer Reviews ({reviewsStats.count})
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-vault-text-muted">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="rounded-lg border border-vault-border bg-vault-surface px-3 py-1.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold cursor-pointer"
                    >
                      <option value="newest">Newest Reviews</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="flex py-10 justify-center">
                      <span className="h-5 w-5 animate-spin rounded-full border border-vault-gold border-t-transparent" />
                    </div>
                  ) : sortedReviews.length === 0 ? (
                    <div className="text-center py-10 rounded-xl border border-dashed border-vault-border bg-vault-surface">
                      <p className="font-body text-xs text-vault-text-muted">No reviews have been written for this Expert Advisor yet.</p>
                    </div>
                  ) : (
                    sortedReviews.map((rev) => {
                      const initials = rev.userName
                        ? rev.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        : 'U';
                      return (
                        <div key={rev.id} className="rounded-xl border border-vault-border bg-vault-surface p-5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vault-gold/10 font-heading text-xs font-bold text-vault-gold border border-vault-gold/20">
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-heading text-xs font-bold text-vault-text">{rev.userName}</p>
                                  {rev.userCountry && (
                                    <span className="rounded bg-vault-surface-high border border-vault-border px-1.5 py-0.5 font-body text-[9px] text-vault-text-muted">
                                      📍 {rev.userCountry}
                                    </span>
                                  )}
                                </div>
                                <p className="font-body text-[9px] text-vault-text-muted">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Rating Stars */}
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} width="11" height="11" viewBox="0 0 16 16" fill={i < rev.rating ? '#F0B90B' : '#475569'}>
                                    <path d="M8 1.5L9.85 5.25L14 5.85L11 8.75L11.7 12.85L8 10.9L4.3 12.85L5 8.75L2 5.85L6.15 5.25L8 1.5Z" />
                                  </svg>
                                ))}
                              </div>
                              {rev.verifiedPurchase && (
                                <span className="rounded bg-vault-profit/10 border border-vault-profit/20 px-2 py-0.5 font-heading text-[8px] font-bold text-vault-profit uppercase tracking-wider">
                                  ✓ Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="font-body text-xs text-vault-text-secondary leading-relaxed pl-1">
                            {rev.comment}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Write Review Form Card */}
                <div className="rounded-xl border border-vault-border bg-vault-surface p-6">
                  <h4 className="font-heading text-base font-bold text-vault-text mb-4">Leave a Verified Review</h4>
                  
                  {!currentUser ? (
                    <div className="rounded-xl bg-vault-bg/50 border border-vault-border p-5 text-center">
                      <p className="font-body text-xs text-vault-text-muted">
                        🔒 Please <Link href="/login" className="text-vault-gold hover:underline font-semibold">log in</Link> and purchase this Expert Advisor to leave a review.
                      </p>
                    </div>
                  ) : !hasPurchased ? (
                    <div className="rounded-xl bg-vault-bg/50 border border-vault-border p-5 text-center">
                      <p className="font-body text-xs text-vault-text-muted">
                        🔒 Only verified purchasers of <strong>{ea.name}</strong> can write reviews.
                      </p>
                    </div>
                  ) : reviewSuccess ? (
                    <div className="rounded-xl bg-vault-profit/10 border border-vault-profit/25 p-5 text-center space-y-2">
                      <p className="font-heading text-sm font-bold text-vault-profit">✓ Review Submitted Successfully</p>
                      <p className="font-body text-xs text-vault-text-secondary">
                        Your review has been saved and is currently pending moderation. It will appear on the platform shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePostReview} className="space-y-4">
                      {reviewError && (
                        <div className="rounded-lg bg-vault-loss/10 border border-vault-loss/20 p-3 text-vault-loss text-xs font-body">
                          {reviewError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="font-body text-xs text-vault-text-muted">Reviewer Name</label>
                          <input
                            type="text"
                            disabled
                            value={currentUser.name || ''}
                            className="w-full mt-1.5 rounded-lg border border-vault-border bg-vault-bg/60 px-3 py-2.5 font-body text-xs text-vault-text outline-none opacity-80 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="font-body text-xs text-vault-text-muted">Rating Score</label>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(parseInt(e.target.value))}
                            className="w-full mt-1.5 rounded-lg border border-vault-border bg-vault-bg px-3 py-2.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold appearance-none cursor-pointer"
                          >
                            <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                            <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                            <option value="3">⭐⭐⭐ (3 Star)</option>
                            <option value="2">⭐⭐ (2 Star)</option>
                            <option value="1">⭐ (1 Star)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-xs text-vault-text-muted">Comment</label>
                        <textarea
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Provide a detailed feedback about your backtests or live trading performance..."
                          rows={4}
                          className="w-full mt-1.5 rounded-lg border border-vault-border bg-vault-bg px-3 py-2.5 font-body text-xs text-vault-text outline-none focus:border-vault-gold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="rounded-lg bg-vault-gold px-6 py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-4 animate-fade-in">
                {(ea.faqs && ea.faqs.length > 0
                  ? ea.faqs.map((f) => ({ q: f.question, a: f.answer }))
                  : [
                      { q: 'Will this robot work with my specific broker?', a: 'Yes! The EA is compatible with any broker offering MT4 or MT5 platforms. However, ECN brokers with raw spreads and low latency VPS connections are highly recommended for optimal results.' },
                      { q: 'How do I download the robot after purchase?', a: 'Downloads are instant. Immediately following order completion, download links will be generated in your user panel and sent directly to your registered email address.' },
                      { q: 'Do you offer assistance with installation?', a: 'Absolutely. Every EA package comes with a PDF user manual and setup guidelines. If you run into issues, our support channel is open 24/7 to assist.' },
                      { q: 'Are lifetime updates included in the pricing?', a: 'Yes! Anytime we update an Expert Advisor to adapt to changing market conditions or release bug fixes, you will receive download details for the updated file free of charge.' }
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-vault-border bg-vault-surface overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-heading text-sm font-bold text-vault-text bg-vault-surface hover:bg-vault-surface-high/30 transition-colors"
                    >
                      {item.q}
                      <span className="text-vault-gold font-mono">{faqOpen[idx] ? '−' : '+'}</span>
                    </button>
                    {faqOpen[idx] && (
                      <div className="p-5 border-t border-vault-border font-body text-xs text-vault-text-secondary leading-relaxed bg-vault-bg/20">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky purchase side section (Removed to prevent desktop duplication) */}
      </section>

      {/* Recently Viewed EAs */}
      <RecentlyViewed />

      {/* Related EAs selection grid */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-vault-border pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading text-xl font-bold tracking-tight text-vault-text">
              Related <span className="text-vault-gold">Expert Advisors</span>
            </h3>
            <Link href="/marketplace" className="font-body text-xs font-semibold text-vault-gold hover:underline">
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rel) => {
              const relDiscount = calcDiscount(rel.mql5Price, rel.ourPrice);

              return (
                <div
                  key={rel.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-vault-border bg-vault-surface p-4 transition-all duration-300 hover:border-vault-gold/20"
                >
                  <div className="relative mb-4 h-28 overflow-hidden rounded-lg bg-vault-bg/60 flex items-center justify-center border border-vault-border">
                    <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 200 100">
                      <path d="M0 80 Q50 30, 100 60 T200 20" stroke="#F0B90B" strokeWidth="1.5" fill="none" />
                    </svg>
                    <span className="font-heading text-[10px] font-bold text-vault-text-muted uppercase bg-vault-surface px-2.5 py-1 rounded border border-vault-border">
                      {rel.category}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-sm font-semibold text-vault-text group-hover:text-vault-gold transition-colors truncate max-w-[70%]">
                        {rel.name}
                      </h4>
                      <span className="rounded bg-blue-500/10 text-blue-400 px-1.5 py-0.5 font-heading text-[8px] font-bold uppercase">
                        {rel.platform === 'both' ? 'MT4/MT5' : rel.platform.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-between font-body text-[10px] text-vault-text-muted">
                      <span>Win Rate:</span>
                      <span className="font-heading font-bold text-vault-profit">{rel.winRate}%</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-vault-border pt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-body text-[9px] text-vault-text-muted line-through">
                        {formatPrice(rel.mql5Price)}
                      </span>
                      <span className="font-heading text-sm font-bold text-vault-profit">
                        {formatPrice(rel.ourPrice)}
                      </span>
                    </div>

                    <Link
                      href={`/marketplace/${rel.slug}`}
                      className="rounded-lg bg-vault-gold/10 px-3 py-2 font-heading text-[10px] font-bold text-vault-gold hover:bg-vault-gold hover:text-vault-bg transition-all"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="mt-20 border-t border-vault-border/50 pt-8 pb-10 text-[10px] font-body text-vault-text-muted leading-relaxed max-w-4xl mx-auto text-center space-y-4">
        <p className="font-heading font-bold uppercase tracking-wider text-vault-text-secondary">⚠️ High Risk Warning Disclaimer</p>
        <p>Algorithmic financial trading carries extreme risk and is not suitable for all investors. Leveraged trading robots can lead to rapid capital losses exceeding starting deposits. Past performance yields, simulated audits, and backtests listed on EAVault do not guarantee future performance results. All software files are provided for demo and educational simulation licenses.</p>
      </footer>

      {/* Lightbox Modal for Full Image Zoom */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <button 
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-6 right-6 text-white/75 hover:text-white text-2xl transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-50"
            aria-label="Close image preview"
          >
            ✕
          </button>
          <div className="relative max-w-7xl max-h-[90vh] overflow-auto rounded-xl border border-white/10 bg-vault-bg/50 p-2 shadow-2xl transition-all duration-300 transform scale-100">
            <img 
              src={activeLightboxImg} 
              alt="High resolution screenshot view" 
              className="max-w-full h-auto object-contain cursor-zoom-out select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
