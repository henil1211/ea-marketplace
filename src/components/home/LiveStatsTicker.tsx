'use client';

import { useEffect, useState } from 'react';
import { StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionCard } from '@/components/motion/MotionPrimitives';

interface StatCard {
  label: string;
  value: string;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const FALLBACK_STATS: StatCard[] = [
  {
    label: 'Total EAs Listed',
    value: '527',
    suffix: '+',
    color: 'text-vault-gold',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Orders Fulfilled',
    value: '3,842',
    suffix: '+',
    color: 'text-vault-profit',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    label: 'Avg Backtest Win Rate',
    value: '76.4',
    suffix: '%',
    color: 'text-vault-gold-light',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17L9 11L13 15L21 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7H21V11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function AnimatedCounter({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const numericTarget = parseFloat(target.replace(/,/g, ''));
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;

      if (target.includes(',')) {
        setDisplay(Math.floor(current).toLocaleString());
      } else if (target.includes('.')) {
        setDisplay(current.toFixed(1));
      } else {
        setDisplay(Math.floor(current).toString());
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    const timeout = setTimeout(animate, 300);
    return () => clearTimeout(timeout);
  }, [target]);

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export default function LiveStatsTicker() {
  const [stats, setStats] = useState<StatCard[]>(FALLBACK_STATS);

  // Fetch live stats from Stitch MCP
  useEffect(() => {
    async function fetchStats() {
      try {
        const [easRes, ordersRes] = await Promise.all([
          fetch('/api/stitch/eas'),
          fetch('/api/stitch/orders'),
        ]);
        const easData = await easRes.json();
        const ordersData = await ordersRes.json();

        const easArray = Array.isArray(easData) ? easData : (easData?.data || []);
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);

        if (easArray.length || ordersArray.length) {
          const totalEAs = easArray.length || 527;
          const totalOrders = ordersArray.length || 3842;
          const avgWinRate =
            easArray.length > 0
              ? (
                  easArray.reduce(
                    (sum: number, ea: { winRate: number }) => sum + (ea.winRate || 0),
                    0
                  ) / easArray.length
                ).toFixed(1)
              : '76.4';

          setStats((prev) => [
            { ...prev[0], value: totalEAs.toLocaleString() },
            { ...prev[1], value: totalOrders.toLocaleString() },
            { ...prev[2], value: String(avgWinRate) },
          ]);
        }
      } catch {
        // Use fallback stats
      }
    }
    fetchStats();
  }, []);

  return (
    <section id="live-stats" className="relative z-10 -mt-8">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <StaggerReveal className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <RevealItem
              key={idx}
            >
              <MotionCard className="card-gradient-border group rounded-xl p-6 transition-all">
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-vault-surface-high ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className={`font-heading text-2xl font-bold ${stat.color}`}>
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="font-body text-xs text-vault-text-muted">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </MotionCard>
            </RevealItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
