import { Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';

const STEPS = [
  {
    step: '01',
    title: 'Browse',
    description: 'Explore our curated collection of 500+ premium Expert Advisors. Filter by platform, strategy, and performance metrics.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21L16.65 16.65" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Purchase',
    description: 'Pay securely with crypto, card, or PayPal. Instant confirmation. No subscriptions — one-time payment, lifetime access.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10H22" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Download & Trade',
    description: 'Instantly download your EA, install on MT4/MT5, and start trading. Full setup guides included with every purchase.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3V15M12 15L8 11M12 15L16 11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <Reveal as="section" id="how-it-works" className="relative overflow-hidden py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-vault-gold/[0.02] blur-[120px]" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-vault-text-secondary">
            Three simple steps to upgrade your trading game.
          </p>
        </div>

        <StaggerReveal className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {/* Connector line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-vault-gold/20 to-transparent md:block" />

          {STEPS.map((item, idx) => (
            <RevealItem key={idx} className="relative text-center">
              {/* Step circle */}
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center">
                {/* Outer ring */}
                <div className="absolute h-28 w-28 rounded-full border border-vault-gold/15" />
                {/* Inner circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-vault-gold/30 bg-vault-surface text-vault-gold">
                  {item.icon}
                </div>
              </div>

              {/* Step number */}
              <span className="font-heading text-xs font-bold tracking-widest text-vault-gold/60">
                STEP {item.step}
              </span>

              {/* Title */}
              <h3 className="mt-2 font-heading text-xl font-semibold text-vault-text">
                {item.title}
              </h3>

              {/* Description */}
              <p className="mx-auto mt-3 max-w-xs font-body text-sm leading-relaxed text-vault-text-secondary">
                {item.description}
              </p>
            </RevealItem>
          ))}
        </StaggerReveal>
      </div>
    </Reveal>
  );
}
