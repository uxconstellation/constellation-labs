import HeroSection from "@/components/landing/HeroSection";
import ProductJourney from "@/components/landing/ProductJourney";
import { ContactClose, DeliveryProcess, PracticalQuestions } from "@/components/landing/LabsSections";

/** Same section order and composition as the Constellation homepage, Labs content. */
export default function Index() {
  return (
    <div className="landing-v3 overflow-x-clip">
      <HeroSection />
      <ProductJourney />
      <DeliveryProcess />
      <PracticalQuestions />
      <ContactClose />
    </div>
  );
}
