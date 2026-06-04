import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';

export default function CustomRequestBanner() {
  return (
    <Reveal as="section" id="custom-request-banner" className="py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-vault-gold/20 bg-gradient-to-br from-vault-surface via-vault-bg to-vault-surface p-10 md:p-16">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-vault-gold/[0.06] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-vault-profit/[0.04] blur-[80px]" />

          {/* Grid pattern overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
            {/* Icon */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-vault-gold/10 glow-gold-sm">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="1.5">
                <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" strokeLinecap="round" />
                <path d="M22 22L20 20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 5V11M13 8H19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                Don&apos;t See the EA You Need?{' '}
                <span className="text-vault-gold">We&apos;ll Get It For You.</span>
              </h2>
              <p className="mt-3 max-w-2xl font-body text-vault-text-secondary">
                Send us the MQL5 link of any Expert Advisor and we&apos;ll source it and list it at our discounted price — typically within 24 hours.
              </p>
            </div>

            {/* CTA */}
            <MotionButton className="inline-flex flex-shrink-0">
              <Link
                href="/request-ea"
                id="cta-request-ea"
                className="inline-flex items-center gap-2 rounded-xl bg-vault-gold px-8 py-4 font-heading text-sm font-bold text-vault-bg transition-all hover:bg-vault-gold-light hover:shadow-[0_0_30px_rgba(240,185,11,0.3)]"
              >
                Request an EA
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </MotionButton>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
