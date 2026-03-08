import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesGridSection from "@/components/landing/FeaturesGridSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SecuritySection from "@/components/landing/SecuritySection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import { getStoredAuthToken } from "@/lib/billingApi";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (getStoredAuthToken()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="landing-shell min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesGridSection />
      <HowItWorksSection />
      <SecuritySection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
