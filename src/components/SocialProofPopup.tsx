'use client';

import { useState, useEffect } from 'react';

interface PurchaseSim {
  name: string;
  country: string;
  eaName: string;
  timeAgo: string;
  flag: string;
}

const COUNTRIES = [
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
];

const EAS = [
  'Gold Scalper Pro',
  'TrendMaster AI',
  'Grid Recovery FX',
  'Breakout Ninja',
  'Hedge Shield Plus',
  'Swing Titan V3',
];

const FIRST_NAMES = [
  'Oliver', 'Lucas', 'Kenji', 'Mateo', 'Sophia', 'Liam', 'David', 'Chloe', 'Emma', 'Max',
  'Gabriel', 'Elena', 'Amara', 'Ravi', 'Ji-hoon', 'Sophie', 'Zoe', 'Daniel', 'Ryan', 'Sarah'
];

export default function SocialProofPopup() {
  const [purchase, setPurchase] = useState<PurchaseSim | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Generate initial random purchase after 8 seconds
    const triggerTimeout = setTimeout(() => {
      generatePurchase();
    }, 8000);

    // Keep generating periodically every 25-40 seconds
    const interval = setInterval(() => {
      generatePurchase();
    }, 32000);

    return () => {
      clearTimeout(triggerTimeout);
      clearInterval(interval);
    };
  }, []);

  const generatePurchase = () => {
    // Select random parameters
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const randomEA = EAS[Math.floor(Math.random() * EAS.length)];
    const randomName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    
    // Anonymize name (e.g. Oliver -> Ol***)
    const anonymized = randomName.substring(0, 2) + '***';
    
    const times = ['just now', '30s ago', '1m ago', '2m ago', '45s ago'];
    const randomTime = times[Math.floor(Math.random() * times.length)];

    setPurchase({
      name: anonymized,
      country: randomCountry.name,
      flag: randomCountry.flag,
      eaName: randomEA,
      timeAgo: randomTime,
    });
    setVisible(true);

    // Auto-hide after 7 seconds
    setTimeout(() => {
      setVisible(false);
    }, 7000);
  };

  if (!purchase) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-[320px] rounded-2xl border border-vault-border bg-vault-surface/85 p-4 shadow-2xl backdrop-blur-md transition-all duration-500 hidden sm:flex items-center gap-3.5 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      {/* Avatar/Flag badge */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vault-bg border border-vault-border text-lg shadow-inner">
        {purchase.flag}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-heading text-[10px] font-bold text-vault-profit tracking-wide uppercase flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-vault-profit animate-ping" />
          Recent Purchase
        </p>
        <p className="mt-0.5 font-body text-xs text-vault-text-secondary leading-snug">
          <strong className="text-vault-text">{purchase.name}</strong> from {purchase.country} bought <span className="text-vault-gold font-bold">{purchase.eaName}</span>.
        </p>
        <span className="mt-1 block font-body text-[9px] text-vault-text-muted">
          {purchase.timeAgo}
        </span>
      </div>

      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-vault-text-muted hover:text-vault-text transition-colors"
        aria-label="Close social proof notification"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor">
          <path d="M1 1L9 9M9 1L1 9" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
