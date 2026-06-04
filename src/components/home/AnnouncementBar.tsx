'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [text, setText] = useState(
    '🔥 Get top-rated MQL5 EAs at up to 80% OFF — Limited time!'
  );

  // Fetch from Stitch MCP settings collection
  useEffect(() => {
    fetch('/api/stitch/settings')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (list && list.length > 0) {
          const item = list[0];
          if (item.announcementActive === false) {
            setVisible(false);
          } else {
            setText(item.announcementText || item.announcementBar || '🔥 Get top-rated MQL5 EAs at up to 80% OFF — Limited time!');
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <div
      id="announcement-bar"
      className="relative z-[60] flex items-center justify-center gap-3 bg-gradient-to-r from-vault-gold/20 via-vault-gold/10 to-vault-gold/20 px-4 py-2.5 text-center"
    >
      {/* Animated border bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vault-gold/40 to-transparent" />

      <p className="font-body text-xs font-medium text-vault-gold-light sm:text-sm">
        {text}
      </p>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-vault-gold/60 transition-colors hover:bg-vault-gold/10 hover:text-vault-gold"
        aria-label="Dismiss announcement"
        id="announcement-dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
