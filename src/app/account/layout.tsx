'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.ok ? await res.json() : null;
          if (data?.authenticated) {
            setUser(data.user);
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Overview', href: '/account/dashboard', icon: '📊' },
    { label: 'My Expert Advisors', href: '/account/my-eas', icon: '🤖' },
    { label: 'My Wishlist', href: '/account/wishlist', icon: '♡' },
    { label: 'Order History', href: '/account/orders', icon: '📜' },
    { label: 'Custom Requests', href: '/account/requests', icon: '📥' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          {/* User profile Summary Card */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 text-center sm:text-left flex flex-col sm:flex-row lg:flex-col items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-vault-gold/10 font-heading text-lg font-bold text-vault-gold border border-vault-gold/25">
              {initials}
            </div>
            <div className="space-y-1">
              <h2 className="font-heading text-base font-bold text-vault-text truncate max-w-[180px]">
                {user.name}
              </h2>
              <p className="font-body text-xs text-vault-text-muted truncate max-w-[180px]">
                {user.email}
              </p>
              <span className="inline-block mt-1.5 rounded-full bg-vault-gold/10 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-vault-gold">
                {user.role === 'admin' ? 'SYSTEM ADMIN' : 'TRADER'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="rounded-2xl border border-vault-border bg-vault-surface overflow-hidden p-2 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-heading text-xs font-semibold transition-all ${
                    active
                      ? 'bg-vault-gold text-vault-bg'
                      : 'text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-text'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-heading text-xs font-semibold text-vault-profit hover:bg-vault-profit/5 transition-all"
              >
                <span className="text-base">⚙️</span>
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-heading text-xs font-semibold text-vault-loss hover:bg-vault-loss/5 transition-all cursor-pointer"
            >
              <span className="text-base">🚪</span>
              Logout
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
