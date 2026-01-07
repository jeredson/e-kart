import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Fallback content when no featured products
  if (isLoading || !featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Premium Tech
                <span className="block text-primary">For Everyone</span>
              </h1>
              
              <p className="text-muted-foreground text-lg max-w-md">
                Discover the latest smartphones, laptops, and accessories. 
                Quality products, unbeatable prices.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="shadow-glow group" onClick={onExplore}>
                  Explore Products
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>


            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80"
                alt="Latest smartphones and tech gadgets"
                className="relative rounded-3xl shadow-elevated w-full object-contain aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id}>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6 animate-slide-up">

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      {product.name}
                    </h1>
                    
                    <p className="text-muted-foreground text-lg max-w-md line-clamp-3">
                      {product.description || 'Discover our premium selection of tech products.'}
                    </p>

                    <div className="text-3xl font-bold text-primary">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        size="lg" 
                        className="shadow-glow group"
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
                        Add to Cart
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => {
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}>
                        View Product
                      </Button>
                    </div>


                  </div>

                  <div className="relative animate-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80'}
                      alt={product.name}
                      className="relative rounded-3xl shadow-elevated w-full object-contain aspect-[4/3]"
                    />
                    
                    <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-elevated animate-scale-in hidden sm:block">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{product.name}</div>
                          <div className="text-primary font-bold">₹{Number(product.price).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>
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
