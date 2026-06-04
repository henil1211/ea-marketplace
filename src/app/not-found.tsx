import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-vault-bg px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-vault-border bg-vault-surface text-3xl text-vault-gold animate-bounce">
          ⚠️
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-vault-text sm:text-5xl">
            404
          </h1>
          <h2 className="font-heading text-lg font-bold text-vault-text-secondary">
            Signal Lost / Page Not Found
          </h2>
          <p className="font-body text-xs text-vault-text-muted leading-relaxed">
            The automated trading route you are trying to access is unavailable, has been moved, or has expired. Let&apos;s get you back on track.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <Link
            href="/"
            className="rounded-xl bg-vault-gold px-6 py-3 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity text-center"
          >
            Go to Homepage
          </Link>
          <Link
            href="/marketplace"
            className="rounded-xl border border-vault-border bg-vault-surface px-6 py-3 font-heading text-xs font-bold text-vault-text hover:border-vault-gold hover:text-vault-gold transition-colors text-center"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
