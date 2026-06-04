import {
  HeroSection,
  LiveStatsTicker,
  FeatureHighlights,
  FeaturedEAs,
  HowItWorks,
  Testimonials,
  CustomRequestBanner,
  NewsletterSignup,
} from '@/components/home';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function Home() {
  return (
    <>
      <HeroSection />
      <LiveStatsTicker />
      <FeatureHighlights />
      <FeaturedEAs />
      <RecentlyViewed />
      <HowItWorks />
      <Testimonials />
      <CustomRequestBanner />
      <NewsletterSignup />
    </>
  );
}
