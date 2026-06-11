import { CtaSection } from "@/components/features/marketing/cta-section";
import { FeaturesGrid } from "@/components/features/marketing/features-grid";
import { Hero } from "@/components/features/marketing/hero";
import { HowItWorks } from "@/components/features/marketing/how-it-works";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
