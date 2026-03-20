import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel';
import BrandGrid from '@/components/BrandGrid';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFromCheckout, setIsLoadingFromCheckout] = useState(false);
  const location = useLocation();
  const { loadCart } = useCart();

  useEffect(() => {
    // Check if coming from checkout page
    if (location.state?.fromCheckout) {
      setIsLoadingFromCheckout(true);
      loadCart().finally(() => {
        setIsLoadingFromCheckout(false);
      });
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {isLoadingFromCheckout && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Updating cart...</p>
          </div>
        </div>
      )}
      <Navbar onSearch={setSearchQuery} />
      <main>
        <FeaturedProductsCarousel />
        <BrandGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
