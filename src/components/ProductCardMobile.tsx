import { Badge } from '@/components/ui/badge';
import { DbProduct } from '@/hooks/useProducts';

interface ProductCardMobileProps {
  product: DbProduct;
  onClick: () => void;
}

const ProductCardMobile = ({ product, onClick }: ProductCardMobileProps) => {
  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Badge */}
      {product.badge && (
        <Badge className="absolute top-2 left-2 z-10 text-xs">{product.badge}</Badge>
      )}

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        {/* Product Name */}
        <h3 className="font-medium text-sm leading-tight line-clamp-2">
          {product.model || product.name}
        </h3>

        {/* Price */}
        <div className="flex flex-col">
          <span className="font-bold text-base">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {!product.in_stock && (
            <span className="text-xs font-medium text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCardMobile;
