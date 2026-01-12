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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {featuredProducts.map((product) => {
              const displayPrice = product.discounted_price || product.price;
              const discountPercent = getDiscountPercentage(product);
              
              return (
                <div key={product.id} className="w-full flex-shrink-0 px-2">
                  <Card className="mx-auto max-w-4xl">
                    <CardContent className="p-6">
                      <div className="flex gap-6 items-start">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 object-contain rounded-lg flex-shrink-0 bg-secondary"
                        />
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-xl sm:text-2xl font-bold mb-3">{product.name}</h3>
                          
                          <div className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                            ₹{Number(displayPrice).toLocaleString('en-IN')}
                          </div>
                          
                          <div className="flex gap-3">
                            <Button 
                              onClick={(e) => handleAddToCart(e, product)}
                              size="lg"
                            >
                              Add to Cart
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedProduct(product)}
                              size="lg"
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {featuredProducts.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
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
