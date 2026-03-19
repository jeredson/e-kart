import { useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel';
import ProductGrid from '@/components/ProductGrid';
import BrandGrid from '@/components/BrandGrid';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFromCheckout, setIsLoadingFromCheckout] = useState(false);
  const productSectionRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loadCart } = useCart();

  // Sync brand filter from URL
  const brandParam = searchParams.get('brand');
  
  useEffect(() => {
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
  }, [brandParam]);

  useEffect(() => {
    // Check if coming from checkout page
    if (location.state?.fromCheckout) {
      setIsLoadingFromCheckout(true);
      loadCart().finally(() => {
        setIsLoadingFromCheckout(false);
      });
    }
  }, [location]);

  const scrollToProducts = () => {
    // Only scroll on desktop, not on mobile
    if (window.innerWidth >= 768) {
      productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(brandName);
    // Scroll to top on mobile instead of to products section
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToProducts();
    }
  };

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
        {!selectedBrand && !searchQuery && (
          <BrandGrid onBrandSelect={handleBrandSelect} />
        )}
        <div ref={productSectionRef}>
          {(selectedBrand || searchQuery) && (
            <ProductGrid
              searchQuery={searchQuery}
              selectedBrand={selectedBrand}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
