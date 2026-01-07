import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';

interface ProductCardProps {
  product: DbProduct;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      {/* Badge */}
      {product.badge && (
        <Badge className="absolute top-4 left-4 z-10">{product.badge}</Badge>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Add Button */}
        <Button
          size="icon"
          className="absolute bottom-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-medium"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
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
          <h3 className="font-display font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
          <Button size="sm" variant="secondary" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
