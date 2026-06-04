import Link from 'next/link';
import TradingGridBg from './TradingGridBg';
import { StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-vault-bg"
    >
      {/* Animated Trading Grid Background */}
      <TradingGridBg />

      {/* Radial gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(240,185,11,0.06)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,192,135,0.04)_0%,transparent_50%)]" />

      {/* Content */}
      <StaggerReveal
        className="relative z-10 mx-auto max-w-[1440px] px-6 pb-20 pt-24 text-center lg:px-12 lg:pb-28 lg:pt-32"
      >
        {/* Badge */}
        <RevealItem className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-vault-gold/20 bg-vault-gold/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-vault-profit animate-pulse" />
          <span className="font-body text-xs font-medium text-vault-gold-light">
            500+ Expert Advisors Available
          </span>
        </RevealItem>

        {/* Headline */}
        <RevealItem className="mx-auto max-w-4xl">
          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          Premium MT4/MT5 Expert Advisors{' '}
          <span className="bg-gradient-to-r from-vault-gold via-vault-gold-light to-vault-gold bg-clip-text text-transparent">
            At a Fraction
          </span>{' '}
          of MQL5 Prices
          </h1>
        </RevealItem>

        {/* Subheadline */}
        <RevealItem>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed text-vault-text-secondary md:text-xl">
            Access 500+ top-rated, fully backtested EAs. Same quality.{' '}
            <span className="font-semibold text-vault-profit">60-80% cheaper.</span>
          </p>
        </RevealItem>

        {/* CTA Buttons */}
        <RevealItem>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MotionButton className="inline-flex">
              <Link
                href="/marketplace"
                id="hero-cta-browse"
                className="group inline-flex items-center gap-2 rounded-xl bg-vault-gold px-8 py-3.5 font-heading text-sm font-bold text-vault-bg transition-all hover:bg-vault-gold-light hover:shadow-[0_0_30px_rgba(240,185,11,0.3)]"
              >
                Browse Marketplace
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MotionButton>
            <MotionButton className="inline-flex">
              <Link
                href="/request-ea"
                id="hero-cta-request"
                className="inline-flex items-center gap-2 rounded-xl border border-vault-border bg-vault-surface/50 px-8 py-3.5 font-heading text-sm font-medium text-vault-text transition-all hover:border-vault-gold/40 hover:bg-vault-surface"
              >
                Request Any EA
              </Link>
            </MotionButton>
          </div>
        </RevealItem>

        {/* Social Proof */}
        <RevealItem>
          <div className="mt-12 flex items-center justify-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {['#F0B90B', '#00C087', '#FF4D4D', '#8A8F9C', '#FFD87F'].map(
                (color, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-vault-bg text-[10px] font-bold text-vault-bg"
                    style={{ backgroundColor: color, zIndex: 5 - i }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                )
              )}
            </div>
            <div className="text-left">
              <p className="font-heading text-sm font-semibold text-vault-text">
                2,500+ Traders
              </p>
              <p className="font-body text-xs text-vault-text-muted">
                Trust EA VAULT for their trading bots
              </p>
            </div>
          </div>
        </RevealItem>
      </StaggerReveal>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-vault-bg to-transparent" />
    </section>
  );
}
