'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { PageShell, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MagneticButton, MouseGlowCard, MotionButton } from '@/components/motion/MotionPrimitives';
import { fadeUp } from '@/lib/motion';

export default function RequestEAPage() {
  const [eaName, setEaName] = useState('');
  const [mql5Url, setMql5Url] = useState('');
  const [platform, setPlatform] = useState<'mt4' | 'mt5' | 'both'>('both');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eaName.trim() || !email.trim() || !whatsapp.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stitch/customRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eaName,
          mql5Url,
          platform,
          whatsapp,
          email,
          notes,
          status: 'new'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit request.');
      }

      setSuccess(true);
      // Reset form fields
      setEaName('');
      setMql5Url('');
      setPlatform('both');
      setWhatsapp('');
      setEmail('');
      setNotes('');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex gap-2 font-body text-xs text-vault-text-muted">
        <Link href="/" className="hover:text-vault-gold">Home</Link>
        <span>/</span>
        <span className="text-vault-text-secondary">Request EA</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7">
          <MouseGlowCard className="group rounded-3xl border border-vault-border bg-vault-surface p-6 sm:p-10">
            <span className="rounded-full bg-vault-gold/10 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-widest text-vault-gold">
              Sourcing Channel
            </span>
            
            <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-vault-text sm:text-4xl">
              Can&apos;t Find the EA You&apos;re Looking For?
            </h1>
            
            <p className="mt-3 font-body text-sm text-vault-text-secondary leading-relaxed">
              Our entire MQL5 library isn&apos;t listed here yet. If you need any specific Expert Advisor, simply fill out this form — we&apos;ll get back to you with availability and pricing within 24 hours.
            </p>

            <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="mt-8 rounded-2xl border border-vault-profit/20 bg-vault-profit/5 p-6 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vault-profit/10 text-vault-profit text-2xl">
                  ✓
                </div>
                <h3 className="font-heading text-lg font-bold text-vault-text">✅ Request received!</h3>
                <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
                  We have added your custom request to our catalog pipeline. Our admin team will source the decrypted EA build and reach out to you at <span className="text-vault-gold font-bold">{email}</span> within 24 hours with a custom discount offer.
                </p>
                <MotionButton className="inline-flex">
                  <button
                    onClick={() => setSuccess(false)}
                    className="rounded-lg bg-vault-surface border border-vault-border px-5 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors"
                  >
                    Submit Another Request
                  </button>
                </MotionButton>
              </motion.div>
            ) : (
              <motion.form key="form" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && (
                  <div className="rounded-lg border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
                    {error}
                  </div>
                )}

                {/* EA Name */}
                <div>
                  <label className="block font-body text-xs font-bold text-vault-text">
                    EA Name <span className="text-vault-loss">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eaName}
                    onChange={(e) => setEaName(e.target.value)}
                    placeholder="e.g. Gold Scalper Pro"
                    className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                  />
                </div>

                {/* MQL5 Link */}
                <div>
                  <label className="block font-body text-xs font-bold text-vault-text">
                    MQL5 Listing URL <span className="font-normal text-vault-text-muted">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={mql5Url}
                    onChange={(e) => setMql5Url(e.target.value)}
                    placeholder="Paste the MQL5 link if you have it"
                    className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block font-body text-xs font-bold text-vault-text mb-2">
                    Platform <span className="text-vault-loss">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {([
                      { value: 'mt4', label: 'MT4 (MetaTrader 4)' },
                      { value: 'mt5', label: 'MT5 (MetaTrader 5)' },
                      { value: 'both', label: 'Both Platforms' }
                    ] as const).map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer font-body text-xs text-vault-text-secondary select-none">
                        <input
                          type="radio"
                          name="platform"
                          checked={platform === opt.value}
                          onChange={() => setPlatform(opt.value)}
                          className="h-4 w-4 bg-vault-bg accent-vault-gold border-vault-border cursor-pointer"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* WhatsApp & Email Row */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      WhatsApp Number <span className="text-vault-loss">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. +12345678900"
                      className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-xs font-bold text-vault-text">
                      Your Email <span className="text-vault-loss">*</span>
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

                {/* Additional Notes */}
                <div>
                  <label className="block font-body text-xs font-bold text-vault-text">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify preferred settings, trading pairs, broker constraints, timeframe requirements, or custom configurations..."
                    rows={4}
                    className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
                  />
                </div>

                {/* Submit button */}
                <MagneticButton className="block w-full">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-xl bg-vault-gold py-4 font-heading text-sm font-bold text-vault-bg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />
                    ) : (
                      <>
                        Send Request
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </MagneticButton>
              </motion.form>
            )}
            </AnimatePresence>
          </MouseGlowCard>
        </div>

        {/* Right Column: Sourcing Process & Guarantees */}
        <StaggerReveal className="lg:col-span-5 space-y-6">
          <RevealItem>
          <MouseGlowCard className="group rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-vault-text">
              How the Sourcing Works
            </h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Submit Request', desc: 'Provide us with the EA Name, or the direct link to the MQL5 marketplace listing.' },
                { step: '2', title: 'We Sift Our Archives', desc: 'We scan our network database containing unlocked, original file archives of 1,000+ top-tier EAs.' },
                { step: '3', title: 'Get Offer & Link', desc: 'We verify the version performance, create optimal setfiles, and email you a direct download listing priced at 60-80% off.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 font-body text-xs text-vault-text-secondary leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vault-gold/10 text-vault-gold font-bold">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-heading font-semibold text-vault-text">{item.title}</h4>
                    <p className="mt-1 text-vault-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </MouseGlowCard>
          </RevealItem>

          <RevealItem>
          <MouseGlowCard className="group rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-vault-text">
              Vault Guarantee
            </h3>
            <ul className="space-y-2 font-body text-xs text-vault-text-secondary">
              <li className="flex items-center gap-2"><span className="text-vault-profit">✓</span> 100% genuine MQL5 compiled files</li>
              <li className="flex items-center gap-2"><span className="text-vault-profit">✓</span> No virus, spyware, or keylogger modifications</li>
              <li className="flex items-center gap-2"><span className="text-vault-profit">✓</span> Setup files and standard presets included</li>
              <li className="flex items-center gap-2"><span className="text-vault-profit">✓</span> Lifetime access & free update cycles</li>
            </ul>
          </MouseGlowCard>
          </RevealItem>
        </StaggerReveal>
      </div>
    </PageShell>
  );
}
