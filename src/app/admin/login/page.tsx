'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      // Verify that the user is actually an admin
      if (data.user.role !== 'admin') {
        // Log them out immediately
        await fetch('/api/auth/logout', { method: 'POST' });
        throw new Error('Access denied. Admin role required.');
      }

      router.refresh();
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-vault-border bg-vault-surface p-8 shadow-2xl">
      <div className="text-center">
        {/* Logo Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-vault-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#0D0F14" stroke="#0D0F14" strokeWidth="1.5"/>
            <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="#0D0F14" stroke="#F0B90B" strokeWidth="1"/>
          </svg>
        </div>
        
        <h1 className="mt-5 font-heading text-xl font-extrabold tracking-tight text-vault-text">
          EA VAULT <span className="text-vault-gold text-xs font-semibold px-2 py-0.5 rounded bg-vault-gold/15 ml-1">ADMIN</span>
        </h1>
        <p className="mt-2 font-body text-xs text-vault-text-secondary">
          Authorized personnel only. Please sign in to access control console.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-vault-loss/20 bg-vault-loss/5 p-4 text-xs text-vault-loss font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Admin Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@eavault.com"
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-vault-text">
            Secret Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-2 rounded-xl border border-vault-border bg-vault-bg px-4 py-3 font-body text-xs text-vault-text outline-none focus:border-vault-gold placeholder:text-vault-text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center items-center gap-2 rounded-xl bg-vault-gold py-3.5 font-heading text-sm font-bold text-vault-bg transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-vault-bg border-t-transparent" />
          ) : (
            'Access Dashboard'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="font-body text-xs text-vault-text-secondary hover:text-vault-gold transition-colors">
          ← Return to trading store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[90vh] items-center justify-center px-6 py-12">
      <Suspense fallback={
        <div className="flex h-[40vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
        </div>
      }>
        <AdminLoginFormContent />
      </Suspense>
    </div>
  );
}
