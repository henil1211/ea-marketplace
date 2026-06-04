import { Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionCard } from '@/components/motion/MotionPrimitives';

const FEATURES = [
  {
    title: 'Cheaper Than MQL5',
    description:
      'Why pay $499 when you can get the same EA for $99? We source premium Expert Advisors and offer them at 60-80% below MQL5 market prices.',
    example: 'EA Gold Scalper: MQL5 $399 -> EA VAULT $79',
    iconBg: 'bg-vault-gold/10',
    iconColor: 'text-vault-gold',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2V22M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Verified Backtest Results',
    description:
      'Every EA on our platform comes with independently verified backtest data - win rates, drawdown metrics, profit factors, and monthly return charts.',
    example: 'Full transparency. No guesswork.',
    iconBg: 'bg-vault-profit/10',
    iconColor: 'text-vault-profit',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Request Any EA',
    description:
      "Can't find the EA you need? Send us the MQL5 link and we'll source it for you within 24 hours - at our discounted price.",
    example: 'Just paste the MQL5 link. We handle the rest.',
    iconBg: 'bg-vault-gold-light/10',
    iconColor: 'text-vault-gold-light',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" strokeLinecap="round" />
        <path d="M22 22L20 20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 5V11M13 8H19" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function FeatureHighlights() {
  return (
    <Reveal as="section" id="features" className="py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Why Traders Choose{' '}
            <span className="text-vault-gold">EA VAULT</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-vault-text-secondary">
            Premium quality Expert Advisors without the premium price tag.
          </p>
        </div>

        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <RevealItem
              key={idx}
            >
              <MotionCard
                className="group h-full rounded-2xl border border-vault-border bg-vault-surface p-8 transition-all duration-300 hover:border-vault-gold/30 hover:shadow-[0_0_30px_rgba(240,185,11,0.06)]"
              >
                {/* Icon */}
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconBg} ${feature.iconColor} transition-transform group-hover:scale-110`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="font-heading text-xl font-semibold text-vault-text">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 font-body text-sm leading-relaxed text-vault-text-secondary">
                  {feature.description}
                </p>

                {/* Example tag */}
                <div className="mt-5 rounded-lg bg-vault-bg px-4 py-2.5">
                  <p className="font-body text-xs font-medium text-vault-text-muted">
                    {feature.example}
                  </p>
                </div>
              </MotionCard>
            </RevealItem>
          ))}
        </StaggerReveal>
      </div>
    </Reveal>
  );
}
