'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloating() {
  const [whatsapp, setWhatsapp] = useState('');
  const [siteName, setSiteName] = useState('EAVault');
  const pathname = usePathname();

  useEffect(() => {
    // Retrieve setting parameters from site database
    fetch(`/api/stitch/settings?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (list && list.length > 0) {
          const item = list[0];
          if (item.whatsapp) {
            setWhatsapp(item.whatsapp);
          }
          if (item.siteName) {
            setSiteName(item.siteName);
          }
        }
      })
      .catch(() => {});
  }, []);

  const activeWhatsapp = whatsapp || '447123456789';

  const isMarketplace = pathname === '/marketplace';

  // Render a beautifully animated floating bubble
  return (
    <a
      href={`https://wa.me/${activeWhatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(siteName)}%2C%20I%20have%20a%20question%20about%20your%20Expert%20Advisors.`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group ${
        isMarketplace ? 'bottom-24' : 'bottom-6'
      }`}
      id="whatsapp-floating-bubble"
      aria-label="Contact support on WhatsApp"
    >
      {/* Pulsing glow background */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

      {/* WhatsApp SVG Icon */}
      <svg
        className="h-8 w-8 fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.46 3.473 1.336 4.989L2 22l5.139-1.348a9.943 9.943 0 0 0 4.873 1.28c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.059 13.985c-.266.75-1.293 1.345-2.094 1.512-.544.113-1.25.203-3.633-.78-3.047-1.258-5.016-4.364-5.168-4.567-.152-.203-1.22-1.625-1.22-3.104 0-1.48.775-2.207 1.05-2.503.275-.296.6-.37.8-.37.2 0 .4 0 .575.008.188.008.437-.074.684.521.254.613.869 2.122.944 2.274.075.152.125.33.025.53-.1.2-.2.32-.395.547-.196.228-.412.51-.59.684-.197.195-.403.407-.174.797.228.39 1.016 1.672 2.176 2.705 1.496 1.334 2.754 1.748 3.146 1.944.39.195.617.162.846-.1.228-.262.974-1.132 1.236-1.518.262-.385.524-.32.883-.187.36.134 2.28 1.07 2.673 1.266.393.195.656.29.722.404.066.113.066.656-.2.14z" />
      </svg>

      {/* Floating tooltip label */}
      <span className="absolute right-16 bg-vault-surface border border-vault-border text-vault-text font-heading text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-xl whitespace-nowrap">
        Need help choosing an EA?
      </span>
    </a>
  );
}
