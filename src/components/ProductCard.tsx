import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import SignInDialog from './SignInDialog';

interface ProductCardProps {
  product: DbProduct;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const getDiscountPercentage = () => {
    if (product.original_price && product.discounted_price) {
      const discount = ((product.original_price - product.discounted_price) / product.original_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const displayPrice = product.discounted_price || product.price;
  const discountPercent = getDiscountPercentage();

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
        
        let orderedSpecs = specs;
        if (specs._ordered && Array.isArray(specs._ordered)) {
          orderedSpecs = {};
          specs._ordered.forEach((spec: any) => {
            orderedSpecs[spec.key] = spec.values;
          });
        }

        Object.entries(orderedSpecs).forEach(([key, value]) => {
          if (key === '_ordered') return;
          
          if (Array.isArray(value)) {
            if (value.length > 0) {
              const firstOption = value[0];
              if (firstOption && typeof firstOption === 'object' && firstOption.value) {
                variants[key] = firstOption.value;
                if (key.toLowerCase().includes('color') && firstOption.image) {
                  variantImage = firstOption.image;
                }
              } else if (typeof firstOption === 'string') {
                variants[key] = firstOption;
              }
            }
          } else if (typeof value === 'string') {
            variants[key] = value;
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      {/* Badge */}
      {product.badge && (
        <Badge className="absolute top-4 left-4 z-10">{product.badge}</Badge>
      )}

      {/* Favorite Button */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full shadow-md"
        onClick={handleFavoriteClick}
      >
        <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Add Button */}
        {product.in_stock && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-medium"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="font-medium">{product.rating || 4.5}</span>
          <span className="text-muted-foreground">({(product.reviews_count || 0).toLocaleString()})</span>
        </div>

        {/* Name & Description */}
        <div>
          {product.brand && (
            <p className="text-sm font-semibold text-foreground mb-0.5">{product.brand}</p>
          )}
          <h3 className="font-display font-medium text-base leading-tight group-hover:text-primary transition-colors">
            {product.model || product.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-xl">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {!product.in_stock && (
              <span className="text-sm font-medium text-red-600">Out of Stock</span>
            )}
          </div>
          
          {/* Mobile Add to Cart Button */}
          {product.in_stock && (
            <Button
              size="sm"
              className="md:hidden"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>

      <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
    </div>
  );
};

export default ProductCard;
