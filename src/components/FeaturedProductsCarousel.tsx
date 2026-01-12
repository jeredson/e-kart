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
    }, 3000);

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
    <section className="py-12 md:py-20 bg-gradient-to-br from-slate-50 to-blue-50">
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
                  <div className="mx-auto max-w-7xl bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
                    <div className="flex flex-row gap-8 md:gap-16 items-center min-h-[300px] md:min-h-[400px]">
                      {/* Product Image */}
                      <div className="w-1/3 md:w-2/5 flex justify-center">
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 shadow-lg">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-24 h-24 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 space-y-4 md:space-y-6">
                        <div className="space-y-3 md:space-y-4">
                          <h1 className="text-lg md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                            {product.name}
                          </h1>
                          {product.description && (
                            <p className="text-xs md:text-base text-gray-600 leading-relaxed max-w-2xl">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Pricing */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                            <span className="text-xl md:text-4xl lg:text-5xl font-bold text-blue-600">
                              ₹{Number(displayPrice).toLocaleString('en-IN')}
                            </span>
                            {originalPrice && originalPrice > displayPrice && (
                              <>
                                <span className="text-sm md:text-2xl text-gray-500 line-through">
                                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                                </span>
                                <span className="bg-green-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-base font-bold">
                                  {discountPercent}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                          <Button 
                            onClick={(e) => handleAddToCart(e, product)}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                            Add to Cart
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedProduct(product)}
                            size="lg"
                            className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-semibold rounded-xl transition-all"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-10 md:mt-12">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-blue-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
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
