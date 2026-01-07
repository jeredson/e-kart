import { Star, ShoppingCart, X, Check, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';
import ProductReviews from './ProductReviews';

interface ProductDetailModalProps {
  product: DbProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const specs = product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)
    ? product.specifications as Record<string, unknown>
    : null;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] md:max-h-[90vh] p-0 overflow-hidden animate-scale-in mx-4 md:mx-0 rounded-xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative aspect-[4/3] md:aspect-square bg-secondary">
              {product.badge && (
                <Badge className="absolute top-3 left-3 z-10 text-xs">{product.badge}</Badge>
              )}
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-6 flex flex-col">
              {/* Category */}
              {product.category && (
                <span className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                  {product.category.name}
                </span>
              )}

              {/* Name */}
              <h2 className="font-display font-bold text-lg md:text-2xl mb-1 md:mb-2">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                  <span className="font-medium text-sm md:text-base">{product.rating || 4.5}</span>
                </div>
                <span className="text-muted-foreground text-xs md:text-sm">
                  ({(product.reviews_count || 0).toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2 md:mb-4">
                <span className="font-display font-bold text-xl md:text-3xl">₹{Number(product.price).toFixed(2)}</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                {product.in_stock !== false ? (
                  <>
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                    <span className="text-green-500 text-xs md:text-sm font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                    <span className="text-destructive text-xs md:text-sm font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">{product.description}</p>

              {/* Specifications */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h3 className="font-semibold text-sm md:text-base mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-1.5 md:p-2 bg-secondary rounded">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mb-4 md:mb-6 border-t border-border pt-3 md:pt-4">
                <ProductReviews productId={product.id} />
              </div>

              {/* Add to Cart Button */}
              <Button
                size="default"
                className="w-full md:h-11"
                onClick={handleAddToCart}
                disabled={product.in_stock === false}
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
