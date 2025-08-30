
import ContactSection from '../components/ContactSection'; 
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorks';
import AnalyticsSection from '../components/AnalyticsSection';
import CTASection from '../components/CTASection';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      {localStorage.getItem('isSignedIn') !== 'true' && <CTASection />}
      <AnalyticsSection />
      <ContactSection />
      <Footer />
    </div>
    </>
  );
};

export default LandingPage;