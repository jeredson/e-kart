import { useRef, useState } from 'react';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import CategoryFilter from './CategoryFilter';
import { Loader2 } from 'lucide-react';

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

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold">Our Products</h2>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} products found
          </p>
        </div>
        <CategoryFilter selected={selectedCategory} onSelect={onCategoryChange} />
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <ProductCard product={product} onClick={() => handleProductClick(product)} />
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
