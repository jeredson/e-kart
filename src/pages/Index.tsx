import { useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useProducts';

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFromCheckout, setIsLoadingFromCheckout] = useState(false);
  const productSectionRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loadCart } = useCart();
  const { data: categories } = useCategories();

  // Sync category filter from URL (?category=Mobiles etc.)
  const categoryParam = searchParams.get('category');
  useEffect(() => {
    if (!categoryParam || !categories?.length) return;
    const name = categoryParam.trim();
    const match = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) setSelectedCategories(match.id);
  }, [categoryParam, categories]);

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
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div ref={productSectionRef}>
          <ProductGrid
            selectedCategories={selectedCategories}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategories}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
