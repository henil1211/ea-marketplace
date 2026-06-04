'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or external service
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-vault-bg px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-3xl text-red-500">
          🚨
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-vault-text sm:text-4xl">
            System Interruption
          </h1>
          <h2 className="font-heading text-sm font-bold text-red-400">
            An unexpected error occurred inside the trading engine.
          </h2>
          <p className="font-body text-xs text-vault-text-muted leading-relaxed">
            The app encountered a runtime issue. Our telemetry logs have tracked this request. Try resetting the page state below.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-vault-gold px-6 py-3 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity text-center cursor-pointer"
          >
            Retry / Reload State
          </button>
          <Link
            href="/"
            className="rounded-xl border border-vault-border bg-vault-surface px-6 py-3 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors text-center"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
