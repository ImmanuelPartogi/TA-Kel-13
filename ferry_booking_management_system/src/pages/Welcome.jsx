import React from 'react';
import Navigation from '../components/landing/Navigation';
import HeroSection from '../components/landing/HeroSection';
import RoutesSection from '../components/landing/RoutesSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowToBookSection from '../components/landing/HowToBookSection';
import AboutSection from '../components/landing/AboutSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';
import AppDownloadModal from '../components/landing/AppDownloadModal';
import { useSettings } from '../hooks/useSettings';

const Welcome = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="antialiased bg-gray-50">
      <Navigation settings={settings} />
      <HeroSection settings={settings} />
      <RoutesSection settings={settings} />
      <FeaturesSection settings={settings} />
      <HowToBookSection settings={settings} />
      <AboutSection settings={settings} />
      <CTASection settings={settings} />
      <Footer settings={settings} />
      <AppDownloadModal />
    </div>
  );
};

export default Welcome;