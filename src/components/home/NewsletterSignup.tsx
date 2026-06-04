'use client';

import { useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // 1. Check for duplicates in subscribers collection
      const checkRes = await fetch('/api/stitch/subscribers');
      if (checkRes.ok) {
        const list = await checkRes.json();
        const exists = list.some(
          (sub: any) => sub.email?.toLowerCase().trim() === email.toLowerCase().trim()
        );
        if (exists) {
          setStatus('duplicate');
          setEmail('');
          setTimeout(() => setStatus('idle'), 5000);
          return;
        }
      }

      // 2. Save to Stitch subscribers collection
      const res = await fetch('/api/stitch/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), subscribedAt: new Date().toISOString() }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }

    // Reset status after 5 seconds
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <Reveal as="section" id="newsletter" className="border-t border-vault-border py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="mx-auto max-w-xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-vault-gold/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F0B90B" strokeWidth="1.5">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
              <path d="M22 6L12 13L2 6" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Get Notified of{' '}
            <span className="text-vault-gold">New EAs</span>
          </h2>
          <p className="mt-3 font-body text-sm text-vault-text-secondary">
            Be the first to know when new Expert Advisors are listed. No spam — just trading opportunities.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              id="newsletter-email"
              className="flex-1 rounded-xl border border-vault-border bg-vault-bg px-5 py-3.5 font-body text-sm text-vault-text placeholder:text-vault-text-muted outline-none transition-all focus:border-vault-gold focus:shadow-[0_0_0_3px_rgba(240,185,11,0.1)]"
            />
            <MotionButton className="inline-flex sm:block">
              <button
                type="submit"
                disabled={status === 'loading'}
                id="newsletter-submit"
                className="w-full rounded-xl bg-vault-gold px-8 py-3.5 font-heading text-sm font-bold text-vault-bg transition-all hover:bg-vault-gold-light hover:shadow-[0_0_20px_rgba(240,185,11,0.2)] disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Notified'}
              </button>
            </MotionButton>
          </form>

          {/* Status messages */}
          {status === 'success' && (
            <p className="mt-3 animate-fade-in font-body text-sm text-vault-profit">
              ✓ You&apos;re in! We&apos;ll notify you of new EA listings.
            </p>
          )}
          {status === 'duplicate' && (
            <p className="mt-3 animate-fade-in font-body text-sm text-vault-gold">
              ℹ You are already subscribed to our newsletter list.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 animate-fade-in font-body text-sm text-vault-loss">
              Something went wrong. Please try again.
            </p>
          )}

          <p className="mt-4 font-body text-xs text-vault-text-muted">
            Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </Reveal>
  );
}
