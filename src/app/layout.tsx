import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/home/AnnouncementBar';
import WhatsAppFloating from '@/components/WhatsAppFloating';
import RequestFloating from '@/components/RequestFloating';
import SocialProofPopup from '@/components/SocialProofPopup';
import OfflineDetector from '@/components/OfflineDetector';
import MaintenanceWrapper from '@/components/MaintenanceWrapper';
import PageTransition from '@/components/motion/PageTransition';
import AmbientBackground from '@/components/motion/AmbientBackground';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import LeadCaptureModal from '@/components/LeadCaptureModal';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'EA VAULT — Premium Expert Advisors Marketplace',
    template: '%s | EA VAULT',
  },
  description:
    'Get top-rated MQL5 Expert Advisors for MetaTrader 4 & 5 at unbeatable prices. Verified backtests, proven performance, instant delivery.',
  keywords: [
    'Expert Advisor',
    'EA',
    'MetaTrader',
    'MT4',
    'MT5',
    'Forex',
    'Trading Bot',
    'MQL5',
    'Automated Trading',
  ],
  openGraph: {
    title: 'EA VAULT — Premium Expert Advisors Marketplace',
    description:
      'Top-rated MQL5 Expert Advisors at unbeatable prices. Verified backtests & proven performance.',
    siteName: 'EA VAULT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-vault-bg text-vault-text">
        <AmbientBackground />
        <MaintenanceWrapper>
          <AnnouncementBar />
          <Navbar />
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <PageTransition>{children}</PageTransition>
          </div>
          <Footer />
          <WhatsAppFloating />
          <RequestFloating />
          <SocialProofPopup />
          <OfflineDetector />
          <AnalyticsTracker />
          <LeadCaptureModal />
        </MaintenanceWrapper>
      </body>
    </html>
  );
}
