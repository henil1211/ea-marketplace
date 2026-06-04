'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AccountRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadRequests() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const meData = await meRes.json();
        const currentUser = meData.user;

        const requestsRes = await fetch('/api/stitch/customRequests');
        
        let allRequests: any[] = [];
        if (requestsRes.ok) allRequests = await requestsRes.json();

        // Filter user requests by email
        const userRequests = allRequests.filter(
          (r: any) => r.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()
        );

        // Sort by date descending
        userRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(userRequests);

      } catch (err) {
        console.error('Error loading custom requests:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return { label: 'New', classes: 'bg-vault-gold/10 text-vault-gold border-vault-gold/20' };
      case 'reviewing':
      case 'quoted':
        return { label: 'In Progress', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'accepted':
      case 'completed':
        return { label: 'Fulfilled', classes: 'bg-vault-profit/10 text-vault-profit border-vault-profit/20' };
      case 'rejected':
        return { label: 'Declined', classes: 'bg-vault-loss/10 text-vault-loss border-vault-loss/20' };
      default:
        return { label: 'Unknown', classes: 'bg-vault-text-muted/10 text-vault-text-muted border-vault-border' };
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-vault-text">
            My Custom EA Requests
          </h1>
          <p className="mt-1.5 font-body text-xs text-vault-text-secondary">
            Track sourcing requests for Expert Advisors not currently available in our marketplace catalog.
          </p>
        </div>
        <Link
          href="/request-ea"
          className="rounded-xl bg-vault-gold px-5 py-2.5 font-heading text-xs font-bold text-vault-bg hover:opacity-90 transition-opacity"
        >
          Submit Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-vault-border bg-vault-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vault-border text-vault-text-muted text-2xl">
            📥
          </div>
          <h3 className="font-heading text-base font-bold text-vault-text">No Custom Requests</h3>
          <p className="font-body text-xs text-vault-text-muted max-w-sm mx-auto leading-relaxed">
            Can&apos;t find your preferred MT4/MT5 strategy tool? Send us a link and we&apos;ll retrieve it at up to 80% OFF.
          </p>
          <Link
            href="/request-ea"
            className="inline-block rounded-xl border border-vault-border px-5 py-2.5 font-heading text-xs font-bold text-vault-text hover:border-vault-gold transition-colors"
          >
            Request Any EA Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, idx) => {
            const statusInfo = getStatusDetails(req.status);
            return (
              <div key={idx} className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-vault-text">{req.eaName}</h3>
                    <span className="font-body text-[10px] text-vault-text-muted">
                      Requested: {new Date(req.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`rounded-full border px-3 py-1 font-heading text-[10px] font-extrabold uppercase ${statusInfo.classes}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl bg-vault-bg border border-vault-border p-4 font-body text-xs text-vault-text-secondary">
                  <div>
                    <span className="text-vault-text-muted block text-[10px] uppercase font-bold tracking-wider">Platform:</span>
                    <span className="mt-1 block font-heading text-xs font-bold uppercase text-vault-text">{req.platform}</span>
                  </div>
                  <div>
                    <span className="text-vault-text-muted block text-[10px] uppercase font-bold tracking-wider">
                      {req.whatsapp ? 'WhatsApp Number:' : 'Your Budget Limit:'}
                    </span>
                    <span className="mt-1 block font-heading text-xs font-bold text-vault-text">
                      {req.whatsapp || req.budget || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-vault-text-muted block text-[10px] uppercase font-bold tracking-wider">MQL5 Listing:</span>
                    <span className="mt-1 block truncate">
                      {req.mql5Url ? (
                        <a
                          href={req.mql5Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-vault-gold hover:underline font-heading text-xs font-bold"
                        >
                          Visit MQL5 Link ↗
                        </a>
                      ) : (
                        <span className="text-vault-text-muted">None Provided</span>
                      )}
                    </span>
                  </div>
                </div>

                {req.notes && (
                  <div className="rounded-xl border border-vault-border bg-vault-bg/30 p-3.5 font-body text-xs text-vault-text-secondary leading-relaxed">
                    <span className="text-vault-text-muted block text-[9px] uppercase font-bold tracking-wider mb-1">Additional Notes:</span>
                    {req.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
