import { Metadata } from 'next';
import Link from 'next/link';
import { PageShell, Reveal } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Expert Advisors Help | EA Vault',
  description: 'Find answers to common questions about EA installation, backtesting, MT4 vs MT5 compatibility, custom EA requests, and support channels.',
  alternates: {
    canonical: 'https://eavault.com/faq',
  },
  openGraph: {
    title: 'EA Vault FAQ — Frequently Asked Questions',
    description: 'Find answers to common questions about EA installation, backtesting, MT4 vs MT5 compatibility, custom EA requests, and support channels.',
    url: 'https://eavault.com/faq',
    type: 'website',
  },
};

export default function FaqPage() {
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
        'name': 'FAQ',
        'item': 'https://eavault.com/faq'
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is EA Vault?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'EA Vault is a curated marketplace that offers premium MetaTrader 4 & 5 Expert Advisors (EAs) at highly accessible prices. We acquire top-rated automated systems, remove restrictive account-locking licenses, and distribute them to retail traders.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How do I download my Expert Advisor after payment?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Downloads are instant. Immediately after purchase, a download button will be generated in your dashboard. You will also receive an automated email containing secure download links.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can you source a specific EA that isn\'t listed on your store?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes, we have a custom sourcing department. Submit a request via our Request EA page, and we will source and unlock the file for you.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageShell>
        {/* Breadcrumbs */}
        <nav className="mb-6 flex gap-2 font-body text-xs text-vault-text-muted">
          <Link href="/" className="hover:text-vault-gold">Home</Link>
          <span>/</span>
          <span className="text-vault-text-secondary">FAQ</span>
        </nav>

        {/* Hero */}
        <Reveal as="section" className="mb-12 text-center max-w-3xl mx-auto pt-6">
          <span className="rounded bg-vault-gold/15 px-3 py-1 font-heading text-xs font-bold text-vault-gold uppercase tracking-wider">
            Help Center
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-6xl">
            Frequently Asked <span className="text-vault-gold">Questions</span>
          </h1>
          <p className="mt-6 font-body text-base text-vault-text-secondary leading-relaxed">
            Have questions about licenses, installation, or setups? Browse our FAQs or search for specific terms.
          </p>
        </Reveal>

        {/* FAQ Filter and Accordions rendering */}
        <section className="mb-20">
          <FaqClient />
        </section>

        {/* Contact/WhatsApp CTAs */}
        <Reveal as="section" className="mb-12 rounded-3xl border border-vault-border bg-gradient-to-r from-vault-surface via-vault-bg to-vault-surface p-8 sm:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-chart-grid opacity-10" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-heading text-2xl font-bold text-vault-text">Still Have Questions?</h2>
            <p className="font-body text-xs sm:text-sm text-vault-text-secondary max-w-xl mx-auto leading-relaxed">
              If you didn&apos;t find what you were looking for, our team is always ready to assist. Reach out directly for personal setup help or general questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MotionButton className="w-full sm:w-auto">
                <a
                  href="https://wa.me/message/YOUR_WHATSAPP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 rounded-xl bg-[#25D366] text-white px-8 py-3.5 font-heading text-xs font-bold shadow-lg shadow-[#25D366]/10 hover:opacity-95 transition-opacity"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </MotionButton>
              <MotionButton className="w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="block w-full text-center rounded-xl border border-vault-border bg-vault-surface-high px-8 py-3.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
                >
                  Contact Support
                </Link>
              </MotionButton>
            </div>
          </div>
        </Reveal>
      </PageShell>
    </>
  );
}
