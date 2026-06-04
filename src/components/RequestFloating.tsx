'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RequestFloating() {
  const pathname = usePathname();
  const isMarketplace = pathname === '/marketplace';

  // Only render on the marketplace page to match the user's specific request
  if (!isMarketplace) return null;

  return (
    <Link
      href="/request-ea"
      id="floating-request-button"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-vault-gold px-5 py-3.5 font-heading text-xs font-bold text-vault-bg shadow-[0_4px_20px_rgba(240,185,11,0.3)] hover:scale-105 transition-transform"
    >
      Request Any EA →
    </Link>
  );
}
