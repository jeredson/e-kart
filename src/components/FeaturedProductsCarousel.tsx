import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';

const FeaturedProductsCarousel = () => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const [currentIndex, setCurrentIndex] = useState(0);

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
                <div key={product.id} className="w-full flex-shrink-0">
                  <Card className="mx-auto max-w-2xl">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-32 h-32 object-contain rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">({product.rating || 0})</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl font-bold text-primary">₹{Number(displayPrice).toLocaleString()}</span>
                            {product.original_price && product.original_price > displayPrice && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">₹{Number(product.original_price).toLocaleString()}</span>
                                {discountPercent > 0 && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                    {discountPercent}% OFF
                                  </span>
                                )}
                              </>
                            )}
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
    </section>
  );
};

export default FeaturedProductsCarousel;
