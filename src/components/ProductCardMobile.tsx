import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { DbProduct } from '@/hooks/useProducts';

interface ProductCardMobileProps {
  product: DbProduct;
  onClick: () => void;
}

const ProductCardMobile = ({ product, onClick }: ProductCardMobileProps) => {
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
      className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer flex gap-3 p-3"
      onClick={onClick}
    >
      {/* Badge */}
      {product.badge && (
        <Badge className="absolute top-2 left-2 z-10 text-xs">{product.badge}</Badge>
      )}

      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-secondary rounded-md">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Top Section */}
        <div className="space-y-1">
          {/* Brand & Model */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {product.brand && (
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
              )}
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {product.model || product.name}
              </h3>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded">
              <span className="font-medium">{product.rating || 4.5}</span>
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="text-muted-foreground">({(product.reviews_count || 0).toLocaleString()})</span>
          </div>

          {/* Key Specs */}
          {product.specifications && (() => {
            const specs = product.specifications as Record<string, any>;
            const ram = specs['RAM'] || specs['ram'] || specs['Memory'];
            const storage = specs['Storage'] || specs['storage'] || specs['ROM'];
            
            if (ram || storage) {
              return (
                <div className="flex flex-wrap gap-2 text-xs">
                  {ram && (
                    <span className="bg-secondary px-2 py-0.5 rounded">
                      RAM: {typeof ram === 'string' ? ram : ram[0]?.value || ram[0]}
                    </span>
                  )}
                  {storage && (
                    <span className="bg-secondary px-2 py-0.5 rounded">
                      Storage: {typeof storage === 'string' ? storage : storage[0]?.value || storage[0]}
                    </span>
                  )}
                </div>
              );
            } else {
              const entries = Object.entries(specs).slice(0, 2);
              if (entries.length > 0) {
                return (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {entries.map(([key, value]) => (
                      <span key={key} className="bg-secondary px-2 py-0.5 rounded">
                        {key}: {typeof value === 'string' ? value : Array.isArray(value) ? value[0]?.value || value[0] : String(value)}
                      </span>
                    ))}
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
          <Button 
            size="sm" 
            className="h-8 px-3 text-xs"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardMobile;
