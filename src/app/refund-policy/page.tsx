import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Refund Policy — Digital Product Terms | EA Vault',
  description: 'Understand the refund policy of EA Vault: eligibility criteria, non-refundable situations, our support-first approach, and contact procedures.',
  alternates: {
    canonical: 'https://eavault.com/refund-policy',
  },
  openGraph: {
    title: 'EA Vault Refund Policy',
    description: 'Understand the refund policy of EA Vault: eligibility criteria, non-refundable situations, our support-first approach, and contact procedures.',
    url: 'https://eavault.com/refund-policy',
    type: 'website',
  },
};

export default function RefundPolicyPage() {
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
        'name': 'Refund Policy',
        'item': 'https://eavault.com/refund-policy'
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
          <span className="text-vault-text-secondary">Refund Policy</span>
        </nav>

        {/* Hero */}
        <Reveal as="section" className="mb-12 max-w-3xl pt-6">
          <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
            Refund Guidelines
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            Refund <span className="text-vault-gold">Policy</span>
          </h1>
          <p className="mt-4 font-body text-xs text-vault-text-muted">
            Last Updated: June 4, 2026
          </p>
        </Reveal>

        {/* Legal Text Layout */}
        <Reveal as="section" className="prose prose-invert max-w-4xl font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed space-y-8 pb-16">
          <div className="border-t border-vault-border pt-6 space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">1. Nature of Digital Products</h2>
            <p>
              Because all Expert Advisors, indicator files, and setfiles sold on EA Vault are digital products downloadable immediately upon transaction validation, they cannot be physically returned or recalled. Once a file is downloaded or delivered, the digital asset is permanently in your possession.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">2. Support-First Approach</h2>
            <div className="rounded-xl border border-vault-gold/20 bg-vault-gold/5 p-5 space-y-2">
              <h3 className="font-heading text-xs font-bold text-vault-gold uppercase">🛠️ Technical Resolution Priority</h3>
              <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                Most technical difficulties (EA not opening trades, license errors on MT4/MT5, incorrect chart timeframes, or lack of indicators) are caused by minor terminal configuration mistakes. Before requesting any refund, you agree to coordinate with our technical support team via WhatsApp or Email. We will assist you with proper configuration, setfiles, and terminal troubleshooting.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">3. Refund Eligibility Criteria</h2>
            <p>
              Refunds are evaluated on a case-by-case basis and are only issued under the following specific circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Corrupted or Non-Functional Files:</strong> The downloaded file is corrupt, throws fatal compilation errors in a standard MetaTrader terminal, and our technical support team is unable to provide a functional replacement within 3 business days.</li>
              <li><strong>Double Purchases:</strong> You accidentally purchased the exact same Expert Advisor twice in a single transaction or sequence. In this case, the duplicate charge will be fully refunded.</li>
              <li><strong>Unreleased Pre-Orders:</strong> You purchased a pre-order or custom EA source that has not yet been delivered, and you request cancellation prior to file transmission.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">4. Non-Refundable Situations</h2>
            <p>
              Under no circumstances will refunds be issued for the following reasons:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Market Losses or Drawdown:</strong> Financial losses incurred during live or demo account trading. Market environments are unpredictable, and you assume all risks when deploying an EA on live capital.</li>
              <li><strong>Change of Mind:</strong> Deciding you no longer want the EA, changing trading styles, or failing to read requirements (such as platform MT4 vs MT5 compatibility) prior to purchase.</li>
              <li><strong>Broker or Server Issues:</strong> Execution errors caused by broker spread expansion, daily swap fees, VPS connection outages, or terminal disconnection.</li>
              <li><strong>Evaluation Failures:</strong> Inability to pass prop firm challenges. While some EAs are prop-safe, challenge outcomes are heavily dependent on market timing, lot sizes, and broker rules.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">5. Refund Request and Contact Procedure</h2>
            <p>
              To file a request for a refund:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email your request to <strong>support@eavault.com</strong> or contact us on WhatsApp.</li>
              <li>Include your Order ID, account email, and a detailed description of the issue.</li>
              <li>Provide screenshots or video recordings of the MetaTrader terminal showing the setup and the specific compilation error in the &quot;Journal&quot; or &quot;Experts&quot; logs.</li>
              <li>Allow up to 2-5 business days for our support team to verify the logs and process eligible payouts back to your original payment method.</li>
            </ol>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
