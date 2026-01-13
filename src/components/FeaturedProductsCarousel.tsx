import { useEffect, useState } from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProductDetailModal from './ProductDetailModal';
import SignInDialog from './SignInDialog';

const FeaturedProductsCarousel = () => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    if (!featuredProducts || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredProducts]);

  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  const getDiscountPercentage = (product: any) => {
    const original = product.original_price;
    const discounted = product.discounted_price || product.price;
    if (original && original > discounted) {
      return Math.round(((original - discounted) / original) * 100);
    }
    return 0;
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!user) {
      setShowSignInDialog(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.discounted_price || product.price),
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-gray-800">Featured Products</h2>
        
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {featuredProducts.map((product) => {
              const displayPrice = product.discounted_price || product.price;
              const originalPrice = product.original_price;
              const discountPercent = getDiscountPercentage(product);
              
              return (
                <div key={product.id} className="w-full flex-shrink-0 px-4">
                  <div className="mx-auto max-w-7xl">
                    <div className="flex flex-row gap-6 md:gap-16 items-center min-h-[200px] md:min-h-[500px]">
                      {/* Mobile & Desktop Layout */}
                      <div className="md:flex-1 md:pr-8">
                        <div className="space-y-3 md:space-y-6">
                          <h1 className="text-xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            {product.name}
                          </h1>
                          
                          {/* Description - Mobile: 2 lines, Desktop: Full */}
                          {product.description && (
                            <p className="text-sm md:text-lg text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-none max-w-2xl">
                              {product.description}
                            </p>
                          )}
                          
                          {/* Pricing */}
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                              <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-blue-600">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
                            <Button 
                              onClick={(e) => handleAddToCart(e, product)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold rounded-lg md:rounded-xl shadow-lg"
                            >
                              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Add to Cart
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedProduct(product)}
                              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-4 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold rounded-lg md:rounded-xl"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-32 h-32 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain rounded-2xl shadow-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
    </section>
  );
};

export default FeaturedProductsCarousel;
