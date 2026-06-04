import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'Privacy Policy — User Data Protection | EA Vault',
  description: 'Read the privacy policy of EA Vault: how we handle user accounts, cookies, analytics tracking, contact forms, WhatsApp inquiries, and secure downloads.',
  alternates: {
    canonical: 'https://eavault.com/privacy',
  },
  openGraph: {
    title: 'EA Vault Privacy Policy',
    description: 'Read the privacy policy of EA Vault: how we handle user accounts, cookies, analytics tracking, contact forms, WhatsApp inquiries, and secure downloads.',
    url: 'https://eavault.com/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
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
        'name': 'Privacy Policy',
        'item': 'https://eavault.com/privacy'
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
          <span className="text-vault-text-secondary">Privacy Policy</span>
        </nav>

        {/* Hero */}
        <Reveal as="section" className="mb-12 max-w-3xl pt-6">
          <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
            Legal Agreements
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            Privacy <span className="text-vault-gold">Policy</span>
          </h1>
          <p className="mt-4 font-body text-xs text-vault-text-muted">
            Last Updated: June 4, 2026
          </p>
        </Reveal>

        {/* Legal Text Layout */}
        <Reveal as="section" className="prose prose-invert max-w-4xl font-body text-xs sm:text-sm text-vault-text-secondary leading-relaxed space-y-8 pb-16">
          <div className="border-t border-vault-border pt-6 space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">1. Information We Collect</h2>
            <p>
              We collect information necessary to process transactions, manage accounts, provide customer support, and improve our services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Identifiable Information:</strong> Name, email address, WhatsApp contact number (when provided in custom request forms), and order details.</li>
              <li><strong>Payment Information:</strong> All payment processing is done securely through certified third-party payment gateways. We do not store or process card numbers, bank credentials, or full transaction details on our servers.</li>
              <li><strong>System and Device Data:</strong> IP addresses, browser types, operating systems, and page navigation sequences.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">2. Analytics and Tracking</h2>
            <p>
              We implement lightweight server logging and third-party web analytics (such as Google Analytics or custom trackers) to monitor traffic patterns, identify performance bottlenecks, and prevent security vulnerabilities. These logs collect non-identifiable usage statistics to optimize page transitions and loading speeds.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">3. Cookies and Session Tracking</h2>
            <p>
              Cookies are small files stored on your computer to assist website function:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Functional Cookies:</strong> Maintain your active login status, retain items in your checkout cart, and store your EA wishlist choices.</li>
              <li><strong>Preference Cookies:</strong> Remember UI state selections and user interface preferences (such as sorting or search selections).</li>
            </ul>
            <p>
              You can disable cookies in your web browser settings. However, doing so may impact checkout functionality and prevent file downloads.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">4. Contact Forms & WhatsApp Inquiries</h2>
            <p>
              When you submit a support request or request a custom EA through our contact and sourcing forms:
            </p>
            <p>
              The info provided (email, name, description, WhatsApp number) is strictly processed to evaluate your requests, source files, and contact you back with details. WhatsApp conversations are handled directly on official WhatsApp business numbers and are encrypted according to WhatsApp guidelines.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">5. Data Retention</h2>
            <p>
              We retain user profile data and purchase histories for as long as your account remains active on the Platform. This is necessary to offer lifetime downloads and update files. If you wish to delete your account and personal details, please contact our support team.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-vault-text">6. Data Security</h2>
            <p>
              We enforce strict industry measures to safeguard your information. Our Platform uses SSL/TLS encryption for all data transit, access controls on our servers, and token-based download systems to prevent file theft and user data exposure.
            </p>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
