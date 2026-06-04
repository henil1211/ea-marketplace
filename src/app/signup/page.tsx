'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Disclaimer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Success! Refresh router to update session state, then redirect
      router.refresh();
      router.push('/account/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 py-12 lg:px-12">
      <div className="w-full max-w-md rounded-3xl border border-vault-border bg-vault-surface p-6 shadow-2xl sm:p-10">
        <div className="text-center">
          <Link href="/" className="inline-block font-heading text-xl font-extrabold tracking-tight text-vault-text">
            EA <span className="text-vault-gold">VAULT</span>
          </Link>
          <h1 className="mt-6 font-heading text-2xl font-bold text-vault-text">
            Create Your Account
          </h1>
          <p className="mt-2 font-body text-xs text-vault-text-secondary">
            Join thousands of traders saving up to 80% on professional MQL5 tools.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Full Name <span className="text-vault-loss">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full mt-1.5 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Email Address <span className="text-vault-loss">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@example.com"
              className="w-full mt-1.5 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Password <span className="text-vault-loss">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full mt-1.5 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-body text-xs font-bold text-vault-text">
              Confirm Password <span className="text-vault-loss">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full mt-1.5 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
            />
          </div>

          {/* Terms and conditions */}
          <div className="flex items-start mt-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-vault-border bg-vault-bg accent-vault-gold cursor-pointer"
            />
            <label htmlFor="agree" className="ml-2 font-body text-[11px] text-vault-text-secondary select-none cursor-pointer leading-normal">
              I agree to the{' '}
              <Link href="/terms" className="text-vault-gold hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge the financial{' '}
              <Link href="/disclaimer" className="text-vault-gold hover:underline">
                Trading Risk Disclaimer
              </Link>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-vault-gold py-3.5 font-heading text-sm font-bold text-vault-bg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Redirect Link */}
        <p className="mt-8 text-center font-body text-xs text-vault-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-vault-gold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
