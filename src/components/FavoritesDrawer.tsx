import { ReactNode, useEffect, useState } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { DbProduct } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface FavoritesDrawerProps {
  children: ReactNode;
}

const FavoritesDrawer = ({ children }: FavoritesDrawerProps) => {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<DbProduct[]>([]);

  useEffect(() => {
    if (favorites.length > 0) {
      loadFavoriteProducts();
    } else {
      setProducts([]);
    }
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .in('id', favorites);
    if (data) setProducts(data as DbProduct[]);
  };

  const handleAddToCart = (product: DbProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.discounted_price || product.price),
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Your Favorites
          </SheetTitle>
        </SheetHeader>

        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No favorites yet</h3>
            <p className="text-muted-foreground text-sm">
              Start adding products to your favorites
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-primary font-semibold mt-1">
                    ₹{Number(product.discounted_price || product.price).toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeFavorite(product.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;
