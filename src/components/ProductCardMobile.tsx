import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import SignInDialog from './SignInDialog';

interface ProductCardMobileProps {
  product: DbProduct;
  onClick: () => void;
}

const ProductCardMobile = ({ product, onClick }: ProductCardMobileProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.in_stock) {
      toast.error('This product is out of stock');
      return;
    }
    if (!user) {
      setShowSignInDialog(true);
      return;
    }

    // Extract first variants from specifications
    const getFirstVariants = () => {
      const variants: Record<string, string> = {};
      let variantImage = product.image;

      if (product.specifications && typeof product.specifications === 'object') {
        const specs = product.specifications as Record<string, any>;
        
        // Handle ordered specifications format
        let orderedSpecs = specs;
        if (specs._ordered && Array.isArray(specs._ordered)) {
          orderedSpecs = {};
          specs._ordered.forEach((spec: any) => {
            orderedSpecs[spec.key] = spec.values;
          });
        }

        Object.entries(orderedSpecs).forEach(([key, value]) => {
          if (key === '_ordered') return;
          
          if (Array.isArray(value) && value.length > 0) {
            const firstOption = value[0];
            if (firstOption && typeof firstOption === 'object' && firstOption.value) {
              variants[key] = firstOption.value;
              
              // Use first color variant image if available
              if (key.toLowerCase().includes('color') && firstOption.image) {
                variantImage = firstOption.image;
              }
            }
          }
        });
      }

      return { variants, variantImage };
    };

    const { variants, variantImage } = getFirstVariants();
    
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    }, variants, variantImage);
    
    const variantText = Object.keys(variants).length > 0 
      ? ` (${Object.values(variants).join(', ')})`
      : '';
    toast.success(`${product.name}${variantText} added to cart!`);
  };

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-4 p-4">
        {/* Badge */}
        {product.badge && (
          <Badge className="absolute top-2 left-2 z-10 text-xs">{product.badge}</Badge>
        )}

        {/* Image */}
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-secondary rounded-md">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Product Info */}
          <div className="space-y-2">
            {/* Brand & Model */}
            {product.brand && (
              <p className="text-sm font-semibold text-foreground">{product.brand}</p>
            )}
            <h3 className="font-medium text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.model || product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 text-xs">
              <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded">
                <span className="font-medium">{product.rating || 4.5}</span>
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
              <span className="text-muted-foreground">({(product.reviews_count || 0).toLocaleString()})</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {!product.in_stock && (
                <span className="text-xs font-medium text-red-600">Out of Stock</span>
              )}
            </div>
            {product.in_stock && (
              <Button 
                size="icon" 
                className="h-8 w-8 flex-shrink-0"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
    </div>
  );
};

export default ProductCardMobile;
