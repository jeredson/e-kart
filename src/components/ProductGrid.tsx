import { useRef, useState } from 'react';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductCardMobile from './ProductCardMobile';
import ProductDetailModal from './ProductDetailModal';
import CategoryFilter from './CategoryFilter';
import FilterPanel, { FilterState } from './FilterPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface ProductGridProps {
  selectedCategories: string | null;
  searchQuery: string;
  onCategoryChange: (category: string | null) => void;
}

const ProductGrid = ({ selectedCategories, searchQuery, onCategoryChange }: ProductGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data: products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  
  const PRODUCTS_PER_PAGE = 5;

  const maxPrice = Math.max(...(products?.map(p => Number(p.price)) || [100000]));
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, maxPrice],
    brands: [],
    ramSizes: [],
    storageSizes: [],
  });

  const resetFilters = () => {
    const resetState: FilterState = {
      priceRange: [0, maxPrice],
      brands: [],
      ramSizes: [],
      storageSizes: [],
    };
    setFilters(resetState);
    setCurrentPage(1);
  };

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategories === null || selectedCategories === product.category_id;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (product.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Price filter
    const price = Number(product.price);
    const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

    // Brand filter
    const matchesBrand = filters.brands.length === 0 || (product.brand && filters.brands.includes(product.brand));

    // Dynamic specification filters
    const specs = product.specifications as Record<string, any> | null;
    const matchesSpecs = Object.keys(filters).every(filterKey => {
      // Skip non-specification filters
      if (filterKey === 'priceRange' || filterKey === 'brands' || filterKey === 'ramSizes' || filterKey === 'storageSizes') return true;
      
      const filterValues = filters[filterKey] as string[];
      // If no filter values selected for this spec, product passes
      if (!filterValues || filterValues.length === 0) return true;
      
      // If product has no specs at all, it doesn't match
      if (!specs) return false;
      
      let specValue = null;
      
      // Check _ordered array first
      if (specs._ordered && Array.isArray(specs._ordered)) {
        for (const item of specs._ordered) {
          if (item && typeof item === 'object' && item.key && item.values) {
            const itemKey = item.key;
            const lowerItemKey = itemKey.toLowerCase();
            
            // For RAM filter
            if (filterKey === 'RAM' && (lowerItemKey === 'ram' || lowerItemKey === 'memory')) {
              specValue = item.values;
              break;
            }
            // For Storage filter
            else if (filterKey === 'Storage' && (lowerItemKey === 'storage' || lowerItemKey === 'rom')) {
              specValue = item.values;
              break;
            }
            // For other specs (case-insensitive match)
            else if (itemKey === filterKey || lowerItemKey === filterKey.toLowerCase()) {
              specValue = item.values;
              break;
            }
          }
        }
      }
      
      // If not found in _ordered, check direct properties
      if (!specValue) {
        // For RAM filter, check RAM, ram, Memory
        if (filterKey === 'RAM') {
          specValue = specs['RAM'] || specs['ram'] || specs['Memory'] || specs['memory'];
        }
        // For Storage filter, check Storage, storage, ROM
        else if (filterKey === 'Storage') {
          specValue = specs['Storage'] || specs['storage'] || specs['ROM'] || specs['rom'];
        }
        // For other specs, exact match
        else {
          specValue = specs[filterKey];
        }
      }
      
      // If product doesn't have this spec key, it doesn't match this filter
      if (specValue === null || specValue === undefined) return false;
      
      // Extract values from the spec and check if any match the filter
      if (typeof specValue === 'string') {
        return filterValues.includes(specValue.trim());
      } else if (typeof specValue === 'number') {
        return filterValues.includes(String(specValue));
      } else if (Array.isArray(specValue)) {
        const values = specValue.map((v: any) => {
          if (v === null || v === undefined) return '';
          if (typeof v === 'string') return v.trim();
          if (typeof v === 'number') return String(v);
          if (typeof v === 'object') {
            if (v.value !== undefined) return String(v.value).trim();
            if (v.label !== undefined) return String(v.label).trim();
          }
          return String(v).trim();
        }).filter(v => v);
        return values.some((v: string) => filterValues.includes(v));
      } else if (typeof specValue === 'object' && !Array.isArray(specValue)) {
        if (specValue.value !== undefined) {
          return filterValues.includes(String(specValue.value).trim());
        }
        if (specValue.label !== undefined) {
          return filterValues.includes(String(specValue.label).trim());
        }
      }
      return false;
    });

    return matchesCategory && matchesSearch && matchesPrice && matchesBrand && matchesSpecs;
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
        <CategoryFilter selected={selectedCategories} onSelect={onCategoryChange} />
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
