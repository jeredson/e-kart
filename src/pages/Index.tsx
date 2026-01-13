import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import FeaturedProductsCarousel from '@/components/FeaturedProductsCarousel';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const productSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
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
