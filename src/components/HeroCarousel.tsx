import { useState, useEffect } from 'react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '@/components/ui/carousel';

interface HeroCarouselProps {
  onExplore: () => void;
}

const HeroCarousel = ({ onExplore }: HeroCarouselProps) => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
  const { addToCart } = useCart();
  const [api, setApi] = useState<CarouselApi>();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!api || !featuredProducts || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api, featuredProducts]);

  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id}>
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  {/* Product Image */}
                  <div className="relative w-full max-w-2xl aspect-square">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain rounded-2xl"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold">
                      {product.name}
                    </h2>
                    
                    <p className="text-muted-foreground text-lg line-clamp-2">
                      {product.description}
                    </p>

                    <div className="text-4xl font-bold text-primary">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Button 
                        size="lg" 
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          description: product.description || '',
                          price: Number(product.price),
                          category: product.category?.name || 'Uncategorized',
                          image: product.image || '/placeholder.svg',
                          rating: Number(product.rating) || 0,
                          reviews: product.reviews_count || 0,
                          badge: product.badge || undefined,
                        })}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {featuredProducts.length > 1 && (
            <>
              <CarouselPrevious className="left-4 lg:-left-12" />
              <CarouselNext className="right-4 lg:-right-12" />
            </>
          )}
        </Carousel>
        
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </section>
  );
};

export default HeroCarousel;
