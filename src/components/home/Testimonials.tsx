import { Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionCard } from '@/components/motion/MotionPrimitives';

const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    country: '🇩🇪',
    countryName: 'Germany',
    rating: 5,
    text: 'Saved over $400 buying Gold Scalper Pro here instead of MQL5. Same exact EA, same performance. EA VAULT is a no-brainer for serious traders.',
    ea: 'Gold Scalper Pro',
  },
  {
    name: 'Sarah K.',
    country: '🇬🇧',
    countryName: 'United Kingdom',
    rating: 5,
    text: "The backtest data they provide is incredibly detailed - monthly returns, drawdown charts, profit factors. It's the transparency that made me trust this platform.",
    ea: 'TrendMaster AI',
  },
  {
    name: 'Ahmed R.',
    country: '🇦🇪',
    countryName: 'UAE',
    rating: 4,
    text: "I couldn't find a specific EA on their marketplace, so I used the custom request feature. They had it listed within 18 hours at 70% off. Incredible service.",
    ea: 'Custom Request',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill={i < rating ? '#F0B90B' : 'none'}
          stroke={i < rating ? '#F0B90B' : '#5A5F6C'}
          strokeWidth="1"
        >
          <path d="M8 1.5L9.85 5.25L14 5.85L11 8.75L11.7 12.85L8 10.9L4.3 12.85L5 8.75L2 5.85L6.15 5.25L8 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <Reveal as="section" id="testimonials" className="bg-vault-surface/50 py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            What Traders{' '}
            <span className="text-vault-gold">Are Saying</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-vault-text-secondary">
            Join thousands of traders who trust EA VAULT for premium Expert Advisors.
          </p>
        </div>

        <StaggerReveal className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((review, idx) => (
            <RevealItem
              key={idx}
            >
              <MotionCard className="group h-full rounded-2xl border border-vault-border bg-vault-bg p-6 transition-all duration-300 hover:border-vault-gold/20">
                {/* Stars */}
                <StarRating rating={review.rating} />

                {/* Quote */}
                <p className="mt-4 font-body text-sm leading-relaxed text-vault-text-secondary">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center justify-between border-t border-vault-border pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vault-surface-high font-heading text-sm font-bold text-vault-gold">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-vault-text">
                        {review.name}
                      </p>
                      <p className="font-body text-xs text-vault-text-muted">
                        {review.country} {review.countryName}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-vault-surface px-2 py-1 font-body text-[10px] text-vault-text-muted">
                    {review.ea}
                  </span>
                </div>
              </MotionCard>
            </RevealItem>
          ))}
        </StaggerReveal>
      </div>
    </Reveal>
  );
}
