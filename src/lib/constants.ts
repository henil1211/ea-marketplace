export const SITE = {
  name: 'EA VAULT',
  tagline: 'Premium Expert Advisors at Unbeatable Prices',
  description: 'Get top-rated MQL5 Expert Advisors for MetaTrader 4 & 5 at a fraction of the original price.',
  url: 'https://eavault.com',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Why Us', href: '/why-us' },
  { label: 'Request EA', href: '/request-ea' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_SECTIONS = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Browse EAs', href: '/marketplace' },
      { label: 'Featured EAs', href: '/featured' },
      { label: 'MT4 EAs', href: '/category/mt4' },
      { label: 'MT5 EAs', href: '/category/mt5' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
] as const;

export const CATEGORIES = [
  { value: 'scalper', label: 'Scalper' },
  { value: 'trend', label: 'Trend Follower' },
  { value: 'grid', label: 'Grid' },
  { value: 'martingale', label: 'Martingale' },
  { value: 'hedging', label: 'Hedging' },
  { value: 'news', label: 'News Trading' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'swing', label: 'Swing' },
  { value: 'other', label: 'Other' },
] as const;

export const PLATFORMS = [
  { value: 'mt4', label: 'MetaTrader 4' },
  { value: 'mt5', label: 'MetaTrader 5' },
  { value: 'both', label: 'MT4 & MT5' },
] as const;
