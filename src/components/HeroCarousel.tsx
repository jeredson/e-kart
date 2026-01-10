import { useState, useEffect } from 'react';
import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductDetailModal from '@/components/ProductDetailModal';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '@/components/ui/carousel';
import ProductCard from '@/components/ProductCard';

interface HeroCarouselProps {
  onExplore: () => void;
}

const HeroCarousel = ({ onExplore }: HeroCarouselProps) => {
  const { data: featuredProducts, isLoading } = useFeaturedProducts();
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
    <section className="container mx-auto px-4 lg:px-8 py-8">
      <Carousel className="w-full" opts={{ loop: true, align: 'start' }} setApi={setApi}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {featuredProducts.map((product) => (
            <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <ProductCard
                product={product}
                onClick={() => {
                  setSelectedProduct(product);
                  setIsModalOpen(true);
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {featuredProducts.length > 1 && (
          <>
            <CarouselPrevious className="-left-4 lg:-left-12" />
            <CarouselNext className="-right-4 lg:-right-12" />
          </>
        )}
      </Carousel>
      
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default HeroCarousel;
