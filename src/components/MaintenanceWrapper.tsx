'use client';

import { useState, useEffect } from 'react';

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contactEmail, setContactEmail] = useState('support@eavault.com');

  useEffect(() => {
    // 1. Immediately bypass for admin routes or API routes
    const path = window.location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      setLoading(false);
      return;
    }

    async function checkMaintenanceAndRole() {
      try {
        // Fetch settings
        const settingsRes = await fetch('/api/stitch/settings');
        let isMaint = false;
        if (settingsRes.ok) {
          const list = await settingsRes.json();
          if (list && list.length > 0) {
            isMaint = !!list[0].maintenanceActive;
            if (list[0].contactEmail) {
              setContactEmail(list[0].contactEmail);
            }
          }
        }

        // Fetch auth role
        let adminUser = false;
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const data = await authRes.json();
          adminUser = data.user?.role === 'admin';
        }

        setIsAdmin(adminUser);
        setMaintenanceMode(isMaint && !adminUser);
      } catch (err) {
        console.error('Error verifying maintenance state:', err);
      } finally {
        setLoading(false);
      }
    }

    checkMaintenanceAndRole();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vault-bg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-vault-gold border-t-transparent" />
      </div>
    );
  }

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-vault-bg px-4 text-center">
        <div className="space-y-6 max-w-lg">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-vault-border bg-vault-surface text-4xl shadow-2xl animate-pulse">
            ⚙️
          </div>
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-vault-gold/10 px-3 py-1 font-heading text-[10px] font-extrabold uppercase tracking-widest text-vault-gold">
              Scheduled System Upgrades
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-vault-text sm:text-4xl">
              Under Maintenance
            </h1>
            <p className="font-body text-xs text-vault-text-secondary leading-relaxed max-w-md mx-auto mt-2">
              We are currently optimizing our backtesting neural layers and upgrading the transaction processing nodes. The EAVault catalog will return live in a few minutes.
            </p>
          </div>
          
          <div className="rounded-xl border border-vault-border bg-vault-surface/40 p-4 max-w-sm mx-auto">
            <span className="block font-body text-[10px] text-vault-text-muted uppercase font-bold tracking-wider">
              Need immediate support?
            </span>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-1 block font-heading text-xs font-bold text-vault-gold hover:underline"
            >
              {contactEmail}
            </a>
          </div>

          <p className="font-body text-[10px] text-vault-text-muted">
            Thank you for your patience. Active trade signals are unaffected.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
