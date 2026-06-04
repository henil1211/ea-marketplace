import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Trading Risk Disclaimer — Legal Notice | EA Vault',
  description: 'Read the risk warnings and disclosures of EA Vault: Forex and CFD trading risks, past performance disclaimers, no profit guarantees, and user responsibilities.',
  alternates: {
    canonical: 'https://eavault.com/disclaimer',
  },
  openGraph: {
    title: 'EA Vault Risk Disclaimer',
    description: 'Read the risk warnings and disclosures of EA Vault: Forex and CFD trading risks, past performance disclaimers, no profit guarantees, and user responsibilities.',
    url: 'https://eavault.com/disclaimer',
    type: 'website',
  },
};

export default function DisclaimerPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://eavault.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Risk Disclaimer',
        'item': 'https://eavault.com/disclaimer'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageShell>
        {/* Breadcrumbs */}
        <nav className="mb-6 flex gap-2 font-body text-xs text-vault-text-muted">
          <Link href="/" className="hover:text-vault-gold">Home</Link>
          <span>/</span>
          <span className="text-vault-text-secondary">Disclaimer</span>
        </nav>

        {/* Hero */}
        <Reveal as="section" className="mb-12 max-w-3xl pt-6">
          <span className="rounded bg-vault-loss/15 px-3 py-1 font-heading text-xs font-bold text-vault-loss uppercase tracking-wider">
            Risk Disclosure
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            Trading Risk <span className="text-vault-loss">Disclaimer</span>
          </h1>
          <p className="mt-4 font-body text-xs text-vault-text-muted">
            Last Updated: June 4, 2026
          </p>
        </Reveal>

        {/* Highlighted Alert Card */}
        <Reveal as="section" className="mb-12 rounded-2xl border border-vault-loss/20 bg-vault-loss/5 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-vault-loss">
            <span className="text-2xl">⚠️</span>
            <h2 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider">
              High Risk Warning: Forex & CFD Trading
</h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed">
            Trading leveraged financial instruments, including Foreign Exchange (Forex) and Contracts for Difference (CFDs), carries an extremely high level of risk. Leveraged trading allows you to control larger positions with a relatively small deposit, which can amplify both profits and losses. You may experience a total loss of your initial deposit, or in some broker conditions, losses that exceed your account balance, requiring additional funding.
          </p>
        </Reveal>

        {/* Main legal text grid with styled boxes */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
          <RevealItem className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📉</span>
              <h3 className="font-heading text-base font-bold text-vault-text">Past Performance Notice</h3>
            </div>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              Any backtesting results, historical trade records, simulate performance metrics, or screenshots of live accounts displayed on EA Vault represent historical analysis. Past performance is not a reliable indicator or guarantee of future trading success. Financial markets are continuously evolving, and historical trends may not repeat.
            </p>
          </RevealItem>

          <RevealItem className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛑</span>
              <h3 className="font-heading text-base font-bold text-vault-text">No Profit Guarantees</h3>
            </div>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              EA Vault makes no representations, guarantees, warranties, or assurances that any Expert Advisor or indicator purchased will generate profits or prevent losses. Algorithmic trading systems operate on mathematical probabilities. Sudden economic events, news announcements, high spread expansions, or broker latency can lead to significant drawdown.
            </p>
          </RevealItem>

          <RevealItem className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h3 className="font-heading text-base font-bold text-vault-text">Educational & Informational Use</h3>
            </div>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              All files, parameters, setfiles, and documentation delivered by EA Vault are intended solely for educational, optimization testing, and informational purposes. None of the content provided on the Platform constitutes investment, financial, tax, or trading advice. You should seek independent advice from a certified financial advisor before trading with real capital.
            </p>
          </RevealItem>

          <RevealItem className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <h3 className="font-heading text-base font-bold text-vault-text">User Sole Responsibility</h3>
            </div>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              You assume full responsibility for your trading activities and decisions. EA Vault, its developers, operators, and affiliates shall not be liable for any trading losses, system outages, broker errors, VPS disconnections, margin calls, or account liquidations resulting from the deployment of any file acquired from the Platform.
            </p>
          </RevealItem>
        </StaggerReveal>
      </PageShell>
    </>
  );
}
