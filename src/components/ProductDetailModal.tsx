import { Star, ShoppingCart, X, Check, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';
import ProductReviews from './ProductReviews';
import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
  product: DbProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || '/placeholder.svg');
      setSelectedVariants({});
    }
  }, [product]);

  if (!product) return null;

  const specs = product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)
    ? product.specifications as Record<string, unknown>
    : null;

  const variantExceptions = product.variant_exceptions as string[] | null;

  const getPrice = () => {
    const variantPricing = product.variant_pricing as Record<string, Record<string, any>> | null;
    
    if (!variantPricing) {
      return Number(product.discounted_price || product.price);
    }

    const pricingVariants: Record<string, string> = {};
    Object.entries(selectedVariants).forEach(([key, value]) => {
      if (!isColorSpec(key)) {
        pricingVariants[key] = value;
      }
    });

    if (Object.keys(pricingVariants).length === 0) {
      return Number(product.discounted_price || product.price);
    }

    const variantKey = Object.values(pricingVariants).join('_');
    
    for (const pricingGroup of Object.values(variantPricing)) {
      const priceData = pricingGroup[variantKey];
      if (priceData) {
        return typeof priceData === 'object' ? priceData.discountedPrice : priceData;
      }
      
      for (const [key, priceInfo] of Object.entries(pricingGroup)) {
        const keyParts = key.split('_');
        const selectedValues = Object.values(pricingVariants);
        
        const allMatch = selectedValues.every(val => keyParts.includes(val));
        if (allMatch && keyParts.length === selectedValues.length) {
          return typeof priceInfo === 'object' ? priceInfo.discountedPrice : priceInfo;
        }
      }
    }

    return Number(product.discounted_price || product.price);
  };

  const getOriginalPrice = () => {
    const variantPricing = product.variant_pricing as Record<string, Record<string, any>> | null;
    
    if (!variantPricing) {
      return product.original_price;
    }

    const pricingVariants: Record<string, string> = {};
    Object.entries(selectedVariants).forEach(([key, value]) => {
      if (!isColorSpec(key)) {
        pricingVariants[key] = value;
      }
    });

    if (Object.keys(pricingVariants).length === 0) {
      return product.original_price;
    }

    const variantKey = Object.values(pricingVariants).join('_');
    
    for (const pricingGroup of Object.values(variantPricing)) {
      const priceData = pricingGroup[variantKey];
      if (priceData && typeof priceData === 'object') {
        return priceData.originalPrice;
      }
    }

    return product.original_price;
  };

  const isColorSpec = (key: string) => {
    return key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');
  };

  const currentPrice = getPrice();
  const originalPrice = getOriginalPrice();

  const getDiscountPercentage = () => {
    if (originalPrice && currentPrice) {
      const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discountPercent = getDiscountPercentage();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: currentPrice,
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    });
    const variantText = Object.keys(selectedVariants).length > 0 
      ? ` (${Object.values(selectedVariants).join(', ')})`
      : '';
    toast.success(`${product.name}${variantText} added to cart!`);
  };

  const handleVariantSelect = (specKey: string, value: any) => {
    setSelectedVariants(prev => ({ ...prev, [specKey]: value.value }));
    if (value.image) {
      setSelectedImage(value.image);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden animate-scale-in mx-2 sm:mx-4 md:mx-0 rounded-xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="max-h-[90vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] md:aspect-square bg-secondary">
              {product.badge && (
                <Badge className="absolute top-3 left-3 z-10 text-xs">{product.badge}</Badge>
              )}
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 sm:p-4 md:p-6 flex flex-col">
              {product.category && (
                <span className="text-xs text-muted-foreground mb-1">
                  {product.category.name}
                </span>
              )}

              <h2 className="font-display font-bold text-base sm:text-lg md:text-2xl mb-1 md:mb-2 leading-tight">{product.name}</h2>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="font-medium text-sm">{product.rating || 4.5}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  ({(product.reviews_count || 0).toLocaleString()} reviews)
                </span>
              </div>

              <div className="mb-2">
                {originalPrice && originalPrice > currentPrice ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-lg sm:text-xl md:text-3xl">₹{currentPrice.toLocaleString('en-IN')}</span>
                      {discountPercent > 0 && (
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground line-through">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <span className="font-display font-bold text-lg sm:text-xl md:text-3xl">₹{currentPrice.toLocaleString('en-IN')}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                {product.in_stock !== false ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3 text-destructive" />
                    <span className="text-destructive text-xs font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground text-xs sm:text-sm mb-3 line-clamp-3">{product.description}</p>

              {specs && Object.keys(specs).length > 0 && (
                <div className="mb-3">
                  <h3 className="font-semibold text-sm mb-2">Specifications</h3>
                  <div className="space-y-3">
                    {Object.entries(specs).map(([key, value]) => {
                      if (Array.isArray(value)) {
                        return (
                          <div key={key}>
                            <div className="text-xs font-medium mb-1">{key}</div>
                            <div className="flex flex-wrap gap-2">
                              {value.map((item: any, idx: number) => {
                                const isException = variantExceptions?.includes(item.value);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => !isException && handleVariantSelect(key, item)}
                                    disabled={isException}
                                    className={`px-3 py-1.5 text-xs rounded border-2 transition-colors ${
                                      isException
                                        ? 'border-muted bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50'
                                        : selectedVariants[key] === item.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border hover:border-primary'
                                    }`}
                                    style={!isException && isColorSpec(key) && item.color ? {
                                      backgroundColor: selectedVariants[key] === item.value ? item.color : 'transparent',
                                      borderColor: selectedVariants[key] === item.value ? item.color : undefined,
                                      color: selectedVariants[key] === item.value ? '#fff' : undefined
                                    } : {}}
                                  >
                                    {item.value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={key} className="flex justify-between p-1.5 bg-secondary rounded text-xs">
                            <span className="text-muted-foreground truncate">{key}</span>
                            <span className="font-medium truncate ml-2">{String(value)}</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}

              <div className="mb-3 border-t border-border pt-3">
                <ProductReviews productId={product.id} />
              </div>

              <Button
                size="sm"
                className="w-full h-9 sm:h-10"
                onClick={handleAddToCart}
                disabled={product.in_stock === false}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
