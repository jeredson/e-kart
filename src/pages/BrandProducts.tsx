import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BrandProducts = () => {
  const { brandName } = useParams<{ brandName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar onSearch={setSearchQuery} />
      <main>
        <ProductGrid
          searchQuery={searchQuery}
          selectedBrand={brandName || null}
        />
      </main>
      <Footer />
    </div>
  );
};

export default BrandProducts;
