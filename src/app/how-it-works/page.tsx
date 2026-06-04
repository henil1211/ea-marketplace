import type { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how EAVault operates. Explore our marketplace of MT4 and MT5 Expert Advisors, compare original MQL5 pricing, download files instantly, and install/trade on MetaTrader.',
  openGraph: {
    title: 'How It Works — EA VAULT',
    description: 'Explore verified MT4/MT5 Expert Advisors, view complete backtest metrics, complete secure checkout, download instantly, and start automated trading.',
  },
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
