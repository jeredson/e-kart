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
    <section className="py-8 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Featured Products</h2>
        
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
                <div key={product.id} className="w-full flex-shrink-0 px-2">
                  <div className="mx-auto max-w-6xl bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 md:p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                      {/* Product Image */}
                      <div className="w-full md:w-1/2 flex justify-center">
                        <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
                        <div>
                          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            {product.name}
                          </h1>
                          {product.description && (
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Pricing */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                            <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600">
                              ₹{Number(displayPrice).toLocaleString('en-IN')}
                            </span>
                            {originalPrice && originalPrice > displayPrice && (
                              <>
                                <span className="text-xl md:text-2xl text-gray-500 line-through">
                                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                                </span>
                                <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm md:text-base font-bold">
                                  {discountPercent}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button 
                            onClick={(e) => handleAddToCart(e, product)}
                            size="lg"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg"
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedProduct(product)}
                            size="lg"
                            className="flex-1 border-2 border-gray-300 hover:border-gray-400 px-8 py-3 text-base font-semibold rounded-xl"
                          >
                            View
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

        <div className="flex justify-center gap-2 mt-8">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
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
