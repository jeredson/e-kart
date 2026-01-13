import { Star, ShoppingCart, X, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';
import ProductReviews from './ProductReviews';
import SignInDialog from './SignInDialog';
import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
  product: DbProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [, forceUpdate] = useState({});

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

  const isColorSpec = (key: string) => {
    return key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');
  };

  const isVariantCombinationException = () => {
    if (!variantExceptions || variantExceptions.length === 0) return false;
    
    const pricingVariants: string[] = [];
    Object.entries(selectedVariants).forEach(([key, value]) => {
      if (!isColorSpec(key)) {
        pricingVariants.push(value);
      }
    });
    
    if (pricingVariants.length === 0) return false;
    
    const variantKey = pricingVariants.join('_');
    return variantExceptions.includes(variantKey);
  };

  const getPrice = () => {
    const variantPricing = product.variant_pricing as Record<string, Record<string, any>> | null;
    
    if (!variantPricing) {
      return Number(product.price);
    }

    const pricingVariants: Record<string, string> = {};
    Object.entries(selectedVariants).forEach(([key, value]) => {
      if (!isColorSpec(key)) {
        pricingVariants[key] = value;
      }
    });

    if (Object.keys(pricingVariants).length === 0) {
      return Number(product.price);
    }

    const variantKey = Object.values(pricingVariants).join('_');
    
    for (const pricingGroup of Object.values(variantPricing)) {
      const priceData = pricingGroup[variantKey];
      if (priceData) {
        return typeof priceData === 'number' ? priceData : Number(product.price);
      }
      
      for (const [key, priceInfo] of Object.entries(pricingGroup)) {
        const keyParts = key.split('_');
        const selectedValues = Object.values(pricingVariants);
        
        const allMatch = selectedValues.every(val => keyParts.includes(val));
        if (allMatch && keyParts.length === selectedValues.length) {
          return typeof priceInfo === 'number' ? priceInfo : Number(product.price);
        }
      }
    }

    return Number(product.price);
  };

  const getVariantStock = () => {
    const variantStock = product.variant_stock as Record<string, number> | null;
    
    if (!variantStock || Object.keys(selectedVariants).length === 0) {
      return null;
    }

    // Try to find a matching key in any order
    const availableKeys = Object.keys(variantStock);
    
    for (const key of availableKeys) {
      // Parse the key to extract variant parts
      const keyParts = key.split(' | ');
      const keyVariants: Record<string, string> = {};
      
      keyParts.forEach(part => {
        const [variantType, variantValue] = part.split(': ');
        if (variantType && variantValue) {
          keyVariants[variantType] = variantValue;
        }
      });
      
      // Check if all selected variants match this key
      const allMatch = Object.entries(selectedVariants).every(([type, value]) => 
        keyVariants[type] === value
      );
      
      if (allMatch && Object.keys(selectedVariants).length === Object.keys(keyVariants).length) {
        return variantStock[key];
      }
    }
    
    return null;
  };

  const currentPrice = getPrice();
  const variantStock = getVariantStock();
  const isVariantAvailable = !isVariantCombinationException();

  const handleAddToCart = () => {
    if (!user) {
      setShowSignInDialog(true);
      return;
    }
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

  const handleFavoriteClick = () => {
    if (!user) {
      setShowSignInDialog(true);
      return;
    }
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
  };

  const handleVariantSelect = (specKey: string, value: any) => {
    setSelectedVariants(prev => {
      const newVariants = { ...prev, [specKey]: value.value };
      console.log('Updated selectedVariants:', newVariants);
      console.log('Product variant_pricing:', product.variant_pricing);
      console.log('Product variant_stock:', product.variant_stock);
      return newVariants;
    });
    if (value.image) {
      setSelectedImage(value.image);
    }
    // Force re-render
    forceUpdate({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden animate-scale-in mx-2 sm:mx-4 md:mx-0 rounded-xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-50 bg-background/80 backdrop-blur-sm h-8 w-8"
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
              {/* Favorite button - Desktop only */}
              <Button
                size="icon"
                variant="secondary"
                className="hidden md:flex absolute top-3 right-3 z-40 h-9 w-9 rounded-full shadow-md"
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
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

              <h2 className="font-display font-bold text-base sm:text-lg md:text-2xl mb-1 md:mb-2 leading-tight flex items-center justify-between gap-2">
                <span className="flex-1">{product.name}</span>
                {/* Favorite button - Mobile only */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="md:hidden h-8 w-8 flex-shrink-0"
                  onClick={handleFavoriteClick}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </h2>

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
                {isVariantAvailable ? (
                  <span className="font-display font-bold text-lg sm:text-xl md:text-3xl">₹{currentPrice.toLocaleString('en-IN')}</span>
                ) : (
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-destructive">Not Available</div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                {product.in_stock !== false && isVariantAvailable ? (
                  <span className="text-green-500 text-xs font-medium">
                    {variantStock !== null ? `${variantStock} in stock` : 'In Stock'}
                  </span>
                ) : (
                  <span className="text-destructive text-xs font-medium">
                    {!isVariantAvailable ? 'Variant Not Available' : 'Out of Stock'}
                  </span>
                )}
              </div>
              
              {/* Debug info */}
              <div className="text-xs text-muted-foreground mb-2">
                Debug: Price={currentPrice}, Stock={variantStock}, Variants={JSON.stringify(selectedVariants)}
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
                                        ? 'border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50'
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
                disabled={product.in_stock === false || !isVariantAvailable}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {!isVariantAvailable ? 'Not Available' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>

        <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
