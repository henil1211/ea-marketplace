import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Terms of Service — Legal Agreements | EA Vault',
  description: 'Read the terms of service governing the usage of EA Vault, our Expert Advisor files, licensing, user responsibilities, and support systems.',
  alternates: {
    canonical: 'https://eavault.com/terms',
  },
  openGraph: {
    title: 'EA Vault Terms of Service',
    description: 'Read the terms of service governing the usage of EA Vault, our Expert Advisor files, licensing, user responsibilities, and support systems.',
    url: 'https://eavault.com/terms',
    type: 'website',
  },
};

export default function TermsPage() {
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
        'name': 'Terms of Service',
        'item': 'https://eavault.com/terms'
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
          <span className="text-vault-text-secondary">Terms of Service</span>
        </nav>

        {/* Hero */}
        <Reveal as="section" className="mb-12 max-w-3xl pt-6">
          <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
            Legal Agreements
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            Terms of <span className="text-vault-gold">Service</span>
          </h1>
          <p className="mt-4 font-body text-xs text-vault-text-muted">
            Last Updated: June 4, 2026
          </p>
        </Reveal>

        {/* Legal Text Layout */}
        <Reveal as="section" className="prose prose-invert max-w-4xl font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed space-y-8 pb-16">
          <div className="border-t border-vault-border pt-6 space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">1. Acceptance of Terms</h2>
            <p>
              By accessing and purchasing from EA Vault (hereinafter referred to as &quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or the &quot;Platform&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service. If you do not agree to these terms, you must immediately cease using the Platform and any of its digital content.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">2. Digital Products and Licenses</h2>
            <p>
              EA Vault provides digital files including but not limited to compiled MetaTrader 4 (.ex4) and MetaTrader 5 (.ex5) Expert Advisors, templates, indicator configurations, and setup parameters (collectively, &quot;Digital Products&quot;).
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All Digital Products sold are provided &quot;as-is&quot;, with all account licensing checks, expiration dates, and authorization scripts fully removed for personal retail backup usage.</li>
              <li>A purchase grants you a personal, perpetual, non-exclusive, and non-transferable license to execute the Digital Products on unlimited trading accounts under your control.</li>
              <li>You may not resell, repackage, distribute, or lease any Digital Products obtained from EA Vault to any third parties without prior written consent.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">3. User Responsibilities</h2>
            <p>
              As a user and trader, you are fully responsible for the configurations and risks associated with live trading terminals:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must evaluate all Expert Advisors on demo accounts first before initiating execution on live funds.</li>
              <li>You must configure proper lot sizing, maximum drawdown rules, and safety metrics matching your account capital.</li>
              <li>You agree to monitor your trading platforms, VPS connections, and internet connectivity to prevent software or execution errors.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">4. Support Policy</h2>
            <p>
              We provide installation and troubleshooting support for all purchased Expert Advisors:
            </p>
            <p>
              Support is limited to file installation, configuration inputs, applying setfiles, and resolving code errors. We do not provide financial advice, broker recommendations, or custom modifications to trading logic. Support channels are available via WhatsApp and Email.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">5. Limitation of Liability & Trading Risks</h2>
            <div className="rounded-xl border border-vault-gold/20 bg-vault-gold/5 p-5 space-y-3">
              <h3 className="font-heading text-xs font-bold text-vault-gold uppercase">Risk Warning</h3>
              <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                Trading financial instruments, forex, contracts for difference (CFDs), and gold involves high risks and can lead to complete loss of capital. EA Vault, its developers, and affiliates shall not be held liable for any financial losses, margin calls, broker slippages, account drawdowns, or damages arising out of your use or inability to use the trading robots.
              </p>
            </div>
            <p>
              Past simulation results and backtest records do not guarantee future performance. Market conditions change dynamically, and algorithmic strategies that historically generated profits may lose money in different market phases.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">6. Intellectual Property</h2>
            <p>
              All branding elements, layout styling, copy, icons, and original assets on the EA Vault website are the intellectual property of EA Vault. Expert Advisors featured on the site are properties of their respective original developers; EA Vault holds no trademark claims over the individual EA names and acts as a retail backup unlock provider.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">7. Termination of Service</h2>
            <p>
              We reserve the right to suspend or terminate your access to product downloads and support channels if we detect violation of our terms, product distribution abuse, fraudulent transactions, or threatening behavior toward our support operators.
            </p>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
