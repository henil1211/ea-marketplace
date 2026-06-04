'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Success! Refresh router to update session state, then redirect
      router.refresh();
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-vault-border bg-vault-surface p-6 shadow-2xl sm:p-10">
      <div className="text-center">
        <Link href="/" className="inline-block font-heading text-xl font-extrabold tracking-tight text-vault-text">
          EA <span className="text-vault-gold">VAULT</span>
        </Link>
        <h1 className="mt-6 font-heading text-2xl font-bold text-vault-text">
          Access Your Trading Vault
        </h1>
        <p className="mt-2 font-body text-xs text-vault-text-secondary">
          Log in to manage your purchased Expert Advisors and licenses.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Email Input */}
        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="trader@example.com"
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center">
            <label className="block font-body text-xs font-bold text-vault-text">
              Password
            </label>
            <Link href="/forgot-password" className="font-body text-[11px] text-vault-gold hover:underline">
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 font-body text-xs text-vault-text-secondary select-none cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center gap-2 rounded-xl bg-vault-gold py-3.5 font-heading text-sm font-bold text-vault-bg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />
          ) : (
            'Log In'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-vault-border" />
        <span className="absolute bg-vault-surface px-4 font-body text-[10px] text-vault-text-muted uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Google OAuth (Mocked/Styled) */}
      <button
        onClick={() => {
          alert('Google authentication is disabled. Please log in with email and password.');
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-vault-border bg-vault-bg py-3 font-heading text-xs font-bold text-vault-text-secondary hover:border-vault-gold transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Google Trading Account
      </button>

      {/* Redirect Link */}
      <p className="mt-8 text-center font-body text-xs text-vault-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-vault-gold hover:underline">
          Sign Up Now
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-12 lg:px-12">
      <Suspense fallback={
        <div className="flex h-[40vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
