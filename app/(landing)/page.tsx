/* Authenticated users hitting `/` are redirected in `proxy.ts`. */
import HeroSection from "@/components/landing/hero-section";
import FeaturesTeamSection from "@/components/landing/features-team";
import Features from "@/components/landing/features-section";
import StatsSection from "@/components/landing/stats";
import FAQsTwo from "@/components/landing/faqs";

/** Landing home — chrome from `(landing)/layout.tsx`. */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="scroll-mt-24" id="features">
        <FeaturesTeamSection />
        <Features />
      </div>
      <div className="scroll-mt-24" id="pricing">
        <StatsSection />
      </div>
      <FAQsTwo />
    </>
  );
}
