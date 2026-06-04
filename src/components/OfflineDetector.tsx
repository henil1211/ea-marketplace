'use client';

import { useState, useEffect } from 'react';

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-bounce max-w-sm rounded-xl border border-red-500/30 bg-vault-bg p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔌</span>
        <div>
          <h4 className="font-heading text-xs font-bold text-vault-text">
            Connection Lost
          </h4>
          <p className="font-body text-[10px] text-vault-text-secondary mt-0.5 leading-normal">
            You are currently offline. Backtest data, pricing models, and download channels will restore once connection is re-established.
          </p>
        </div>
      </div>
    </div>
  );
}
