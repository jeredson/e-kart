import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, isLoading } = useCart();

  if (isLoading) {
    return <div className="p-4">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h3 className="font-display font-semibold text-xl mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground">Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={`${item.id}-${JSON.stringify(item.variants)}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain rounded-lg bg-secondary"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                
                {/* Variant Information */}
                {item.variants && Object.keys(item.variants).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {Object.entries(item.variants).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-lg">₹{item.price.toLocaleString('en-IN')}</span>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variants)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variants)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.id, item.variants)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total: ₹{totalPrice.toLocaleString('en-IN')}</span>
          <Button size="lg">Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;