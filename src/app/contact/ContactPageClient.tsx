'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageShell, Reveal } from '@/components/motion/Reveal';

export default function ContactPageClient() {
  // Settings fetched dynamically from Stitch MCP
  const [supportEmail, setSupportEmail] = useState('support@eavault.com');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [siteName, setSiteName] = useState('EAVault');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactHandle, setContactHandle] = useState('');

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Accordion FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Retrieve setting parameters from database
    fetch(`/api/stitch/settings?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (list && list.length > 0) {
          const item = list[0];
          if (item.contactEmail) {
            setSupportEmail(item.contactEmail);
          }
          if (item.whatsapp) {
            setWhatsappNumber(item.whatsapp);
          }
          if (item.siteName) {
            setSiteName(item.siteName);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/stitch/contactMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          contactHandle,
          status: 'new',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send contact message.');
      }

      setSuccess(true);
      // Reset fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setContactHandle('');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while sending your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const supportFaqs = [
    {
      q: 'How long does support take?',
      a: 'We usually reply to support email inquiries and contact form submissions within 2 to 4 hours. Our WhatsApp live support is available during standard trading sessions.',
    },
    {
      q: 'Can I get help installing an EA?',
      a: 'Yes, absolutely. Every EA download contains a comprehensive user installation guide PDF and setup presets. If you run into issues, our support team can assist you step-by-step.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'Due to the digital delivery and compiled nature of MetaTrader Expert Advisor files, all sales are final. However, if a file fails to load or has defects, we will fix it or replace it immediately.',
    },
    {
      q: 'Can I request custom trading bots?',
      a: 'Yes! You can request custom bots from MQL5 or specific algorithmic models. Check out our Request EA page, or use this contact page to outline your trading ideas.',
    },
    {
      q: 'Do you support MT4 and MT5?',
      a: 'Yes, we support both MetaTrader 4 and MetaTrader 5 architectures. Each product details page displays platform compatibilities prominently.',
    },
  ];

  const trustBadges = [
    {
      title: 'Secure Marketplace',
      desc: 'SSL encryption & protected accounts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-vault-gold">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: 'Verified Backtests',
      desc: 'Detailed drawdown & win metrics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-vault-profit">
          <path d="M3 3V21H21M18.5 7.5L14 13L10 9.5L6 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Instant Delivery',
      desc: 'Downloads unlocked immediately',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Trader Support',
      desc: 'Expert assistance when you need it',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-400">
          <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2C16.75 2 21 6.25 21 11.5Z" stroke="currentColor" strokeWidth="2" />
          <path d="M22 22L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <PageShell className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex gap-2 font-body text-xs text-vault-text-muted">
        <Link href="/" className="hover:text-vault-gold transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-vault-text-secondary">Contact</span>
      </nav>

      {/* Hero Section */}
      <Reveal as="section" className="text-center max-w-3xl mx-auto mb-16">
        <span className="rounded-full bg-vault-gold/10 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-vault-gold">
          Get In Touch
        </span>
        <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
          Contact EAVault
        </h1>
        <p className="mt-4 font-body text-sm sm:text-base text-vault-text-secondary leading-relaxed">
          Need help choosing an EA or requesting a specific strategy? Our support team is here to help.
        </p>
      </Reveal>

      {/* Contact Cards Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-20">
        {/* Email Support */}
        <div className="card-gradient-border border border-vault-border p-6 flex flex-col justify-between hover:border-vault-gold/30 transition-colors duration-300">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vault-gold/10 text-vault-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-4 font-heading text-sm font-bold text-vault-text">Email Support</h3>
            <p className="mt-2.5 font-body text-[11px] text-vault-text-secondary leading-relaxed">
              Drop us an email for account queries, download issues, or technical setup issues.
            </p>
          </div>
          <div className="mt-6 border-t border-vault-border pt-4">
            <a
              href={`mailto:${supportEmail}`}
              className="font-heading text-xs font-bold text-vault-gold hover:underline truncate block"
            >
              {supportEmail}
            </a>
            <span className="mt-1 block font-body text-[10px] text-vault-text-muted">
              Average reply: 2-4 hours
            </span>
          </div>
        </div>

        {/* WhatsApp Support */}
        <div className="card-gradient-border border border-vault-border p-6 flex flex-col justify-between hover:border-vault-gold/30 transition-colors duration-300">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
              </svg>
            </div>
            <h3 className="mt-4 font-heading text-sm font-bold text-vault-text">WhatsApp Support</h3>
            <p className="mt-2.5 font-body text-[11px] text-vault-text-secondary leading-relaxed">
              Speak directly with an agent for rapid technical support or order inquiries.
            </p>
          </div>
          <div className="mt-6 border-t border-vault-border pt-4">
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(siteName)}%20support%20desk.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-heading text-xs font-bold text-white hover:opacity-90 transition-opacity"
              >
                Chat on WhatsApp
              </a>
            ) : (
              <span className="font-heading text-xs font-bold text-vault-text-muted">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Custom EA Requests */}
        <div className="card-gradient-border border border-vault-border p-6 flex flex-col justify-between hover:border-vault-gold/30 transition-colors duration-300">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H5M12 18L5 11L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-4 font-heading text-sm font-bold text-vault-text">Custom EA Requests</h3>
            <p className="mt-2.5 font-body text-[11px] text-vault-text-secondary leading-relaxed">
              Looking for a specific trading robot or MT4/MT5 EA not listed in our catalog?
            </p>
          </div>
          <div className="mt-6 border-t border-vault-border pt-4">
            <Link
              href="/request-ea"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-vault-border bg-vault-surface-high px-4 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors"
            >
              Request EA File
            </Link>
          </div>
        </div>

        {/* Business & Partnerships */}
        <div className="card-gradient-border border border-vault-border p-6 flex flex-col justify-between hover:border-vault-gold/30 transition-colors duration-300">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21V19C22.9993 18.1137 22.6909 17.2532 22.1214 16.5667C21.5519 15.8803 20.7537 15.4035 19.86 15.21M16 3.13C16.8999 3.2968 17.7285 3.77431 18.3362 4.47503C18.9439 5.17576 19.293 6.05988 19.32 7C19.32 7.95 18.97 8.81 18.37 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="mt-4 font-heading text-sm font-bold text-vault-text">Partnerships</h3>
            <p className="mt-2.5 font-body text-[11px] text-vault-text-secondary leading-relaxed">
              Contact us for affiliate opportunities, reseller collaborations, or custom partnerships.
            </p>
          </div>
          <div className="mt-6 border-t border-vault-border pt-4">
            <span className="font-heading text-xs font-bold text-vault-text block">
              partners@eavault.com
            </span>
            <span className="mt-1 block font-body text-[10px] text-vault-text-muted">
              Corporate & Affiliate desk
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid: Form + FAQ */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 mb-20">
        {/* Contact Form Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-vault-border bg-vault-surface p-6 sm:p-10">
            <h2 className="font-heading text-2xl font-bold text-vault-text">
              Send Support Message
            </h2>
            <p className="mt-2 font-body text-xs text-vault-text-secondary">
              Fill out the form below and our technical help desk will reach out to you.
            </p>

            {success ? (
              <div className="mt-8 rounded-2xl border border-vault-profit/20 bg-vault-profit/5 p-8 text-center space-y-4 animate-scale-up">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vault-profit/10 text-vault-profit text-2xl">
                  ✓
                </div>
                <h3 className="font-heading text-lg font-bold text-vault-text">Message Dispatched!</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  ✅ Your message has been received. We will check it and reply to your email address soon.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="rounded-lg bg-vault-surface border border-vault-border px-5 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-8 space-y-6">
                {error && (
                  <div className="rounded-lg border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      Full Name <span className="text-vault-loss">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      Email Address <span className="text-vault-loss">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. trader@example.com"
                      className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                    />
                  </div>
                </div>

                {/* Subject & Handle Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      Subject <span className="text-vault-loss">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Installation help / EA query"
                      className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      Telegram/WhatsApp Handle <span className="font-normal text-vault-text-muted">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={contactHandle}
                      onChange={(e) => setContactHandle(e.target.value)}
                      placeholder="e.g. @username or +12345"
                      className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block font-body text-xs font-bold text-vault-text">
                    Message <span className="text-vault-loss">*</span>
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message details here. Please include EA name or order numbers if applicable..."
                    rows={5}
                    className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-vault-gold py-4 font-heading text-sm font-bold text-vault-bg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />
                  ) : (
                    <>
                      Send Message →
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Support FAQs Accordion */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-vault-text">
              Support FAQs
            </h2>
            <p className="mt-2 font-body text-xs text-vault-text-secondary">
              Review basic answers to help queries instantly.
            </p>
          </div>

          <div className="space-y-4">
            {supportFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-vault-border bg-vault-surface overflow-hidden transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between px-5 py-4.5 text-left font-heading text-xs font-bold text-vault-text hover:text-vault-gold transition-colors duration-200"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vault-surface-high border border-vault-border text-vault-text-secondary transition-transform duration-300">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-60 border-t border-vault-border' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <p className="px-5 py-4 font-body text-[11px] text-vault-text-secondary leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 py-12 border-y border-vault-border mb-20 bg-vault-surface/20 rounded-3xl px-6">
        {trustBadges.map((badge, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vault-surface-high border border-vault-border">
              {badge.icon}
            </div>
            <div>
              <h4 className="font-heading text-xs font-bold text-vault-text">{badge.title}</h4>
              <p className="mt-1 font-body text-[10px] text-vault-text-secondary leading-relaxed">
                {badge.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Office location/map styled placeholder */}
      <section className="rounded-3xl border border-vault-border bg-vault-surface p-6 sm:p-8 text-center max-w-4xl mx-auto overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <h3 className="font-heading text-lg font-bold text-vault-text mb-2">Our Operating Locations</h3>
        <p className="font-body text-xs text-vault-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
          EAVault services global algorithmic traders. Our cloud architecture and digital support centers operate around the clock.
        </p>

        {/* Map Placeholder */}
        <div className="h-64 sm:h-80 w-full rounded-2xl bg-vault-surface-low border border-vault-border flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Faux map circles */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full border border-vault-text-muted animate-pulse" />
            <div className="h-96 w-96 rounded-full border border-vault-text-muted animate-pulse delay-700 absolute" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vault-gold/15 text-vault-gold border border-vault-gold/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <h4 className="font-heading text-xs font-bold text-vault-text">Digital Sourcing Hub</h4>
            <p className="font-body text-[10px] text-vault-text-secondary">
              Main Operations: London, UK & Singapore Support Desk
            </p>
            <span className="inline-block rounded-full bg-vault-gold/10 px-3 py-1 font-body text-[9px] text-vault-gold">
              Server Cluster Status: ACTIVE (0ms Latency)
            </span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
