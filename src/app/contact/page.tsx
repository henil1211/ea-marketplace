import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Need help choosing an EA or requesting a specific strategy? Contact EAVault email support or talk with our team on WhatsApp for technical setup help.',
  openGraph: {
    title: 'Contact Us — EA VAULT',
    description: 'Get in touch with EAVault support. Sourcing questions, setup assistance, reseller requests, and custom Expert Advisors queries.',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
