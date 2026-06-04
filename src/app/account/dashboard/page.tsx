'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function AccountDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard calculations
  const [purchasedEAs, setPurchasedEAs] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch user profile
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const currentUser = meData.user;
        setUser(currentUser);

        // 2. Fetch orders
        const ordersRes = await fetch('/api/stitch/orders');
        const easRes = await fetch('/api/stitch/eas');
        
        let allOrders: any[] = [];
        let allEAs: any[] = [];

        if (ordersRes.ok) allOrders = await ordersRes.json();
        if (easRes.ok) allEAs = await easRes.json();

        // Filter user orders
        const userOrders = allOrders.filter(
          (o: any) => o.userId === currentUser.userId && o.status === 'completed'
        );

        // Calculate total spent
        const spent = userOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
        setTotalSpent(spent);

        // Map purchased EAs
        const easMap = new Map(allEAs.map((e: any) => [e.id, e]));
        const bought: any[] = [];
        
        userOrders.forEach((o: any) => {
          const matchingEA = easMap.get(o.eaId);
          if (matchingEA) {
            bought.push({
              ...matchingEA,
              purchaseDate: o.createdAt,
              orderId: o.orderId,
              paidAmount: o.amount
            });
          }
        });

        // Sort by purchase date descending
        bought.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        setPurchasedEAs(bought);
        setRecentPurchases(bought.slice(0, 3));

        // 3. Fetch custom requests count
        const requestsRes = await fetch('/api/stitch/customRequests');
        if (requestsRes.ok) {
          const allRequests = await requestsRes.json();
          const userRequests = allRequests.filter(
            (r: any) => r.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()
          );
          
          const pending = userRequests.filter(
            (r: any) => r.status === 'new' || r.status === 'pending' || r.status === 'reviewing'
          ).length;
          setPendingRequestsCount(pending);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDownload = async (eaId: string, eaName: string) => {
    try {
      const res = await fetch(`/api/download/${eaId}/token`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize download');
      }

      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Could not retrieve secure download link.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while requesting file download.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            Welcome back, {user?.name || 'Trader'}
          </h1>
          <p className="mt-1 font-body text-xs text-vault-text-secondary">
            Manage your automated portfolio, licenses, and custom system requests.
          </p>
        </div>
        <Link
          href="/marketplace"
          className="rounded-xl bg-vault-gold px-6 py-2.5 text-center font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
        >
          Browse Marketplace
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-2.5">
          <div className="text-vault-text-muted font-body text-xs uppercase tracking-wider">
            EAs Purchased
          </div>
          <div className="font-heading text-3xl font-extrabold text-vault-text">
            {purchasedEAs.length}
          </div>
        </div>
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-2.5">
          <div className="text-vault-text-muted font-body text-xs uppercase tracking-wider">
            Total Spent
          </div>
          <div className="font-heading text-3xl font-extrabold text-vault-gold">
            ${totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 space-y-2.5">
          <div className="text-vault-text-muted font-body text-xs uppercase tracking-wider">
            Pending Custom Requests
          </div>
          <div className="font-heading text-3xl font-extrabold text-emerald-400">
            {pendingRequestsCount}
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-vault-text">Recent Purchases</h2>
          {purchasedEAs.length > 3 && (
            <Link
              href="/account/my-eas"
              className="font-heading text-xs font-bold text-vault-gold hover:underline"
            >
              View All EAs ({purchasedEAs.length})
            </Link>
          )}
        </div>

        {recentPurchases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-vault-border bg-vault-surface p-8 text-center space-y-3">
            <p className="font-body text-xs text-vault-text-muted">No EA downloads available yet.</p>
            <Link
              href="/marketplace"
              className="inline-block text-xs font-heading font-bold text-vault-gold hover:underline"
            >
              Browse Marketplace &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPurchases.map((ea, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-2xl border border-vault-border bg-vault-surface p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-vault-bg border border-vault-border flex items-center justify-center">
                    {ea.thumbnail ? (
                      <img src={ea.thumbnail} alt={ea.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">🤖</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-vault-text">{ea.name}</h3>
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-heading font-extrabold uppercase ${
                        ea.platform === 'mt4' ? 'bg-blue-500/10 text-blue-400' :
                        ea.platform === 'mt5' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-vault-gold/10 text-vault-gold'
                      }`}>
                        {ea.platform}
                      </span>
                      <span className="font-body text-[10px] text-vault-text-muted">
                        Purchased: {new Date(ea.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownload(ea.id, ea.name)}
                    className="flex-1 sm:flex-none text-center rounded-lg bg-vault-gold px-4 py-2 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
                  >
                    Download
                  </button>
                  <Link
                    href={`/marketplace/${ea.slug}`}
                    className="flex-1 sm:flex-none text-center rounded-lg border border-vault-border px-4 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors"
                  >
                    Setup Guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 flex flex-col justify-between items-start space-y-4">
          <div className="space-y-2">
            <h3 className="font-heading text-base font-bold text-vault-text">
              Need custom setup assistance?
            </h3>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              We offer free technical support for setting up your expert advisors on a VPS. Feel free to contact our expert traders.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded-lg border border-vault-border px-4 py-2 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <div className="rounded-2xl border border-vault-border bg-vault-surface p-6 flex flex-col justify-between items-start space-y-4">
          <div className="space-y-2">
            <h3 className="font-heading text-base font-bold text-vault-text">
              Request a missing EA
            </h3>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed">
              If you want an advisor that is not listed in our store catalog, submit a request and we will extract it for you at a discount.
            </p>
          </div>
          <Link
            href="/request-ea"
            className="rounded-lg bg-vault-gold/10 px-4 py-2 font-heading text-xs font-bold text-vault-gold hover:bg-vault-gold hover:text-vault-bg transition-all"
          >
            Request Any EA
          </Link>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="pt-4">
        <RecentlyViewed />
      </div>
    </div>
  );
}
