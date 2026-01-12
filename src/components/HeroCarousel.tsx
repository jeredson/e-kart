import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import ProductDetailModal from '@/components/ProductDetailModal';
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
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id}>
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
                  <div className="flex gap-4 lg:flex-col lg:gap-6 w-full animate-slide-up">
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-32 h-32 lg:hidden rounded-2xl shadow-elevated object-contain flex-shrink-0"
                    />
                    
                    <div className="flex-1 lg:space-y-6">
                      <h1 className="font-display text-xl sm:text-2xl lg:text-6xl font-bold leading-tight line-clamp-2 lg:line-clamp-none">
                        {product.name}
                      </h1>
                      
                      <p className="text-muted-foreground text-sm lg:text-lg max-w-md line-clamp-2 lg:line-clamp-3 hidden sm:block">
                        {product.description || 'Discover our premium selection of tech products.'}
                      </p>

                      <div className="text-xl lg:text-3xl font-bold text-primary">
                        ₹{Number(product.discounted_price || product.price).toLocaleString('en-IN')}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 lg:gap-4">
                        <Button 
                          size="sm"
                          className="shadow-glow group lg:text-base"
                          onClick={() => addToCart({
                            id: product.id,
                            name: product.name,
                            description: product.description || '',
                            price: Number(product.discounted_price || product.price),
                            category: product.category?.name || 'Uncategorized',
                            image: product.image || '/placeholder.svg',
                            rating: Number(product.rating) || 0,
                            reviews: product.reviews_count || 0,
                            badge: product.badge || undefined,
                          })}
                        >
                          Add to Cart
                          <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button size="sm" variant="outline" className="lg:text-base" onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}>
                          View
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative animate-fade-in hidden lg:block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="relative rounded-3xl shadow-elevated w-full object-contain aspect-[4/3]"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {featuredProducts.length > 1 && (
            <>
              <CarouselPrevious className="left-4 lg:-left-12 hidden sm:flex" />
              <CarouselNext className="right-4 lg:-right-12 hidden sm:flex" />
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
