'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function verifyAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user.role === 'admin') {
            setAdminUser(data.user);
          } else {
            router.push('/admin/login');
            return;
          }
        } else {
          router.push('/admin/login');
          return;
        }

        // Fetch custom requests to count new ones
        const requestsRes = await fetch('/api/stitch/customRequests');
        if (requestsRes.ok) {
          const requests = await requestsRes.json();
          const newCount = requests.filter((r: any) => r.status === 'new' || r.status === 'pending').length;
          setNewRequestsCount(newCount);
        }

        // Fetch leads to count new ones
        const leadsRes = await fetch('/api/stitch/leads');
        if (leadsRes.ok) {
          const leads = await leadsRes.json();
          const list = Array.isArray(leads) ? leads : (leads?.data || []);
          const newCount = list.filter((l: any) => l.status === 'new').length;
          setNewLeadsCount(newCount);
        }
      } catch (err) {
        console.error('Admin layout validation error:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyAdmin();
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAdminUser(null);
      router.refresh();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'EA Management', href: '/admin/eas', icon: '🤖' },
    { label: 'Add New EA', href: '/admin/eas/new', icon: '➕' },
    { label: 'Featured EAs', href: '/admin/featured', icon: '⭐' },
    {
      label: 'Leads Management',
      href: '/admin/leads',
      icon: '👥',
      badge: newLeadsCount > 0 ? newLeadsCount : undefined
    },
    { label: 'Orders', href: '/admin/orders', icon: '💰' },
    {
      label: 'Custom Requests',
      href: '/admin/requests',
      icon: '📥',
      badge: newRequestsCount > 0 ? newRequestsCount : undefined
    },
    { label: 'Review Moderation', href: '/admin/reviews', icon: '💬' },
    { label: 'Activity Logs', href: '/admin/activity', icon: '📋' },
    { label: 'Site Settings', href: '/admin/settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vault-bg text-vault-text">
        <div className="text-center space-y-4">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-vault-gold border-t-transparent" />
          <p className="font-body text-xs text-vault-text-secondary">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  // Login page has no sidebar wrapper
  if (isLoginPage) {
    return <div className="min-h-screen bg-vault-bg text-vault-text">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex">
      {/* Desktop Sidebar (visible >= lg) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-vault-border bg-vault-surface">
        {/* Brand header */}
        <div className="p-6 border-b border-vault-border flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vault-gold shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#0D0F14" stroke="#0D0F14" strokeWidth="1.5"/>
                <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="#0D0F14" stroke="#F0B90B" strokeWidth="1"/>
              </svg>
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-vault-text">
              Vault <span className="text-vault-gold">Console</span>
            </span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-4 py-3 font-heading text-xs font-semibold transition-all ${
                  active
                    ? 'bg-vault-gold text-vault-bg'
                    : 'text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-heading font-extrabold ${
                    active ? 'bg-vault-bg text-vault-gold' : 'bg-vault-gold text-vault-bg'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin profile footer */}
        {adminUser && (
          <div className="p-4 border-t border-vault-border space-y-3 bg-vault-bg/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vault-gold/10 font-heading text-xs font-bold text-vault-gold border border-vault-gold/20">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-xs font-bold text-vault-text truncate">{adminUser.name}</p>
                <p className="font-body text-[10px] text-vault-text-muted truncate">{adminUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 justify-center rounded-xl border border-vault-border px-3 py-2 font-heading text-[11px] font-bold text-vault-loss hover:border-vault-loss hover:bg-vault-loss/5 transition-all cursor-pointer"
            >
              🚪 Sign Out Console
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar for Mobile (visible < lg) */}
        <header className="lg:hidden h-16 border-b border-vault-border bg-vault-surface px-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vault-gold shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#0D0F14" stroke="#0D0F14" strokeWidth="1.5"/>
                <path d="M12 6L6 9V15L12 18L18 15V9L12 6Z" fill="#0D0F14" stroke="#F0B90B" strokeWidth="1"/>
              </svg>
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-vault-text">
              Vault <span className="text-vault-gold">Console</span>
            </span>
          </Link>
          
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-vault-border"
          >
            ☰
          </button>
        </header>

        {/* Mobile Slide-Out Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-vault-bg/85 backdrop-blur-sm">
            <div className="w-64 max-w-[80vw] bg-vault-surface border-r border-vault-border flex flex-col h-full animate-slide-right">
              <div className="p-6 border-b border-vault-border flex items-center justify-between">
                <span className="font-heading text-base font-bold text-vault-text">
                  Vault <span className="text-vault-gold">Console</span>
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-vault-border"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {menuItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 font-heading text-xs font-semibold transition-all ${
                        active
                          ? 'bg-vault-gold text-vault-bg'
                          : 'text-vault-text-secondary hover:bg-vault-surface-high hover:text-vault-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-heading font-extrabold ${
                          active ? 'bg-vault-bg text-vault-gold' : 'bg-vault-gold text-vault-bg'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {adminUser && (
                <div className="p-4 border-t border-vault-border space-y-3 bg-vault-bg/20">
                  <p className="font-heading text-xs font-bold text-vault-text truncate">{adminUser.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 justify-center rounded-xl border border-vault-border px-3 py-2 font-heading text-[11px] font-bold text-vault-loss hover:bg-vault-loss/5 transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            {/* Click outside to close drawer */}
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Content body container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
