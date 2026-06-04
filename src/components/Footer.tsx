'use client';

import Link from 'next/link';
import { FOOTER_SECTIONS, SITE } from '@/lib/constants';
import { Reveal, StaggerReveal, RevealItem } from '@/components/motion/Reveal';
import { MotionButton } from '@/components/motion/MotionPrimitives';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Reveal as="section" className="border-t border-vault-border bg-vault-surface">
    <footer>
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12">
        <StaggerReveal className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <RevealItem className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2" id="footer-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vault-gold">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#0D0F14" stroke="#0D0F14" strokeWidth="1.5"/>
                  <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="#0D0F14" stroke="#F0B90B" strokeWidth="1"/>
                </svg>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-vault-text">
                EA <span className="text-vault-gold">VAULT</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-vault-text-secondary">
              {SITE.description}
            </p>
            {/* Social Icons Placeholder */}
            <div className="mt-6 flex gap-3">
              {['Telegram', 'WhatsApp', 'Discord'].map((social) => (
                <MotionButton key={social} className="inline-flex">
                  <a
                    href="#"
                    id={`footer-social-${social.toLowerCase()}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-vault-border text-vault-text-muted transition-all hover:border-vault-gold hover:text-vault-gold hover:shadow-[0_0_18px_rgba(240,185,11,0.12)]"
                    aria-label={social}
                  >
                    <span className="text-xs font-bold">{social[0]}</span>
                  </a>
                </MotionButton>
              ))}
            </div>
          </RevealItem>

          {/* Link Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <RevealItem key={section.title}>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-vault-text">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-vault-text-secondary transition-colors hover:text-vault-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </StaggerReveal>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-vault-border pt-8 md:flex-row">
          <p className="font-body text-xs text-vault-text-muted">
            &copy; {currentYear} {SITE.name}. All rights reserved.
          </p>
          <p className="font-body text-xs text-vault-text-muted">
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
    </Reveal>
  );
}
