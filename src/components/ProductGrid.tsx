import { useRef, useState } from 'react';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardMobile from './ProductCardMobile';
import ProductDetailModal from './ProductDetailModal';
import CategoryFilter from './CategoryFilter';
import FilterPanel, { FilterState } from './FilterPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
}

const ProductGrid = ({ selectedCategory, searchQuery, onCategoryChange }: ProductGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const maxPrice = Math.max(...(products?.map(p => Number(p.price)) || [100000]));
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, maxPrice],
    brands: [],
    ramSizes: [],
    storageSizes: [],
  });

  const resetFilters = () => {
    setFilters({
      priceRange: [0, maxPrice],
      brands: [],
      ramSizes: [],
      storageSizes: [],
    });
  };

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Price filter
    const price = Number(product.price);
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

    // Brand filter
    const matchesBrand = filters.brands.length === 0 || (product.brand && filters.brands.includes(product.brand));

    // RAM filter
    let matchesRam = filters.ramSizes.length === 0;
    if (!matchesRam && product.specifications) {
      const specs = product.specifications as Record<string, any>;
      const ram = specs['RAM'] || specs['ram'] || specs['Memory'];
      if (ram) {
        const ramValues = Array.isArray(ram) ? ram.map((r: any) => r.value || r) : [ram];
        matchesRam = ramValues.some((r: string) => filters.ramSizes.includes(r));
      }
    }

    // Storage filter
    let matchesStorage = filters.storageSizes.length === 0;
    if (!matchesStorage && product.specifications) {
      const specs = product.specifications as Record<string, any>;
      const storage = specs['Storage'] || specs['storage'] || specs['ROM'];
      if (storage) {
        const storageValues = Array.isArray(storage) ? storage.map((s: any) => s.value || s) : [storage];
        matchesStorage = storageValues.some((s: string) => filters.storageSizes.includes(s));
      }
    }

    return matchesCategory && matchesSearch && matchesPrice && matchesBrand && matchesRam && matchesStorage;
  }) || [];

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
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Our Products</h2>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products found
            </p>
          </div>
          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilterPanel filters={filters} onFilterChange={setFilters} onReset={resetFilters} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
        <CategoryFilter selected={selectedCategory} onSelect={onCategoryChange} />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        {!isMobile && (
          <aside className="w-64 flex-shrink-0">
            <FilterPanel filters={filters} onFilterChange={setFilters} onReset={resetFilters} />
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className={isMobile 
              ? "flex flex-col gap-3" 
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            }>
              {filteredProducts.map((product, index) => (
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
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {products?.length === 0 
                  ? 'No products have been added yet. Check back soon!'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </div>
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
