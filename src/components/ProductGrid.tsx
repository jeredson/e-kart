import { useRef, useState } from 'react';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardMobile from './ProductCardMobile';
import ProductDetailModal from './ProductDetailModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
  searchQuery: string;
  selectedBrand?: string | null;
}

const ProductGrid = ({ searchQuery, selectedBrand }: ProductGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const PRODUCTS_PER_PAGE = isMobile ? 10 : 15; // Mobile: 2x5, Desktop: 3x5

  const filteredProducts = products?.filter((product) => {
    // Match by brand name (case-insensitive) instead of brand_id
    const matchesSelectedBrand = selectedBrand === null || selectedBrand === undefined || 
      product.brand?.toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    return matchesSelectedBrand && matchesSearch;
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProductClick = (product: DbProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section ref={gridRef} className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
      {/* Back Button - Shows when viewing brand products */}
      {selectedBrand && (
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brands
          </Button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">
              {selectedBrand ? `${selectedBrand} Products` : 'Our Products'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products found
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
          {paginatedProducts.length > 0 ? (
            <>
              <div className={isMobile 
                ? "grid grid-cols-2 gap-3" 
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              }>
                {paginatedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-slide-up"
                  >
                    {isMobile ? (
                      <ProductCardMobile product={product} onClick={() => handleProductClick(product)} />
                    ) : (
                      <ProductCard product={product} onClick={() => handleProductClick(product)} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {products?.length === 0 
                  ? 'No products have been added yet. Check back soon!'
                  : 'Try adjusting your search criteria'
                }
              </p>
            </div>
          )}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default ProductGrid;
