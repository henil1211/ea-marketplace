'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyEAsPage() {
  const [loading, setLoading] = useState(true);
  const [purchasedEAs, setPurchasedEAs] = useState<any[]>([]);

  useEffect(() => {
    async function loadPurchasedEAs() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const currentUser = meData.user;

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

      } catch (err) {
        console.error('Error loading purchased EAs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPurchasedEAs();
  }, []);

  // Mock function to generate license keys
  const generateLicenseKey = (eaId: string, orderId: string) => {
    const key = `VLT-${eaId.slice(0, 4)}-${orderId.replace('ORD-', '')}-${orderId.slice(-4)}`;
    return key.toUpperCase();
  };

  // Secure download handler
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-vault-text">
          My Purchased Expert Advisors
        </h1>
        <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
          Access your digital asset licenses, setup parameters, and active software packages.
        </p>
      </div>

      {purchasedEAs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-vault-border bg-vault-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vault-border text-vault-text-muted text-2xl">
            🤖
          </div>
          <h3 className="font-heading text-base font-bold text-vault-text">No EAs Purchased Yet</h3>
          <p className="font-body text-xs text-vault-text-muted max-w-sm mx-auto leading-relaxed">
            You don&apos;t have any active EA software downloads linked to your account yet. Shop our collections to begin.
          </p>
          <Link
            href="/marketplace"
            className="inline-block rounded-xl bg-vault-gold px-6 py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
          >
            Browse Marketplace →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {purchasedEAs.map((ea, idx) => (
            <div key={idx} className="rounded-2xl border border-vault-border bg-vault-surface p-6 flex flex-col justify-between space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-vault-bg border border-vault-border flex items-center justify-center">
                    {ea.thumbnail ? (
                      <img src={ea.thumbnail} alt={ea.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">🤖</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-vault-text leading-tight">{ea.name}</h3>
                    <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-heading font-extrabold uppercase ${
                        ea.platform === 'mt4' ? 'bg-blue-500/10 text-blue-400' :
                        ea.platform === 'mt5' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-vault-gold/10 text-vault-gold'
                      }`}>
                        {ea.platform}
                      </span>
                      <span className="font-body text-[10px] text-vault-text-muted">
                        Active License
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Table */}
                <div className="rounded-xl bg-vault-bg border border-vault-border p-3.5 space-y-2 font-body text-xs text-vault-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-vault-text-muted">Purchase Date:</span>
                    <span>{new Date(ea.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vault-text-muted">Order ID:</span>
                    <span className="font-heading font-semibold text-vault-text">{ea.orderId}</span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-vault-border mt-2 space-y-1">
                    <span className="text-vault-text-muted text-[10px] uppercase font-bold tracking-wider">License Key:</span>
                    <div className="flex items-center justify-between bg-vault-surface border border-vault-border rounded px-2.5 py-1 mt-1 font-heading text-[10px] font-bold text-vault-gold select-all">
                      <span>{generateLicenseKey(ea.id, ea.orderId)}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generateLicenseKey(ea.id, ea.orderId));
                          alert('License Key copied to clipboard!');
                        }}
                        className="text-vault-text-muted hover:text-vault-gold transition-colors font-body text-[9px] cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownload(ea.id, ea.name)}
                  className="flex justify-center items-center rounded-xl bg-vault-gold py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
                >
                  Download Files
                </button>
                <Link
                  href={`/marketplace/${ea.slug}`}
                  className="flex justify-center items-center rounded-xl border border-vault-border py-2.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors"
                >
                  Setup Guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
