import { MeshGradient } from "@/components/landing/MeshGradient";
import { Hero } from "@/components/landing/Hero";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { ResumeBuilderSection } from "@/components/landing/ResumeBuilderSection";
import { ATSAnalyzerSection } from "@/components/landing/ATSAnalyzerSection";
import { LinkedInOptimizerSection } from "@/components/landing/LinkedInOptimizerSection";
import { JobSearchSection } from "@/components/landing/JobSearchSection";
import { MockInterviewSection } from "@/components/landing/MockInterviewSection";
import { CodingPracticeSection } from "@/components/landing/CodingPracticeSection";
import { Statistics } from "@/components/landing/Statistics";
import { SuccessStories } from "@/components/landing/SuccessStories";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen selection:bg-premium-blue/20 selection:text-premium-blue dark:selection:bg-premium-blue/40 dark:selection:text-white scroll-smooth">
      {/* Fixed Interactive Background */}
      <MeshGradient />
      
      {/* Sections composed seamlessly without abrupt transitions */}
      <Hero />
      <FeaturesBento />
      
      {/* Feature Showcases */}
      <ResumeBuilderSection />
      <ATSAnalyzerSection />
      <LinkedInOptimizerSection />
      <JobSearchSection />
      <MockInterviewSection />
      <CodingPracticeSection />
      
      {/* Social Proof */}
      <Statistics />
      <SuccessStories />
      <Testimonials />
      
      {/* Support & Conversion */}
      <FAQ />
      <FinalCTA />
      
      {/* Footer */}
      <Footer />
    </main>
  );
}
