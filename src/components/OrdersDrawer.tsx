import { ReactNode, useState, useEffect } from 'react';
import { Package, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OrdersDrawerProps {
  children: ReactNode;
}

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
  variant_image: string;
  shop_name: string;
  shop_address: string;
  is_delivered: boolean;
  is_canceled: boolean;
  created_at: string;
  products: {
    name: string;
    brand: string;
    model: string;
    price: number;
  };
}

const OrdersDrawer = ({ children }: OrdersDrawerProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const ordersWithProducts = await Promise.all(
        data.map(async (order) => {
          const { data: product } = await supabase
            .from('products')
            .select('name, brand, model, price')
            .eq('id', order.product_id)
            .single();

          return {
            ...order,
            products: product || { name: 'Unknown Product', brand: '', model: '', price: 0 }
          };
        })
      );
      setOrders(ordersWithProducts as Order[]);
    }
    setIsLoading(false);
  };

  const cancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Restock the product variant if not delivered
    if (!order.is_delivered) {
      const { data: product } = await supabase
        .from('products')
        .select('variant_stock')
        .eq('id', order.product_id)
        .single();

      if (product?.variant_stock) {
        const sortedEntries = Object.entries(order.variants).sort(([keyA], [keyB]) => {
          const order = ['Color', 'COLOR', 'Ram', 'RAM', 'Storage', 'STORAGE'];
          const indexA = order.findIndex(k => k.toLowerCase() === keyA.toLowerCase());
          const indexB = order.findIndex(k => k.toLowerCase() === keyB.toLowerCase());
          return indexA - indexB;
        });
        
        const variantStockKey = sortedEntries
          .map(([key, value]) => `${key}: ${value}`)
          .join(' | ');

        const variantStock = product.variant_stock as Record<string, number>;
        const currentStock = variantStock[variantStockKey];

        if (currentStock !== undefined) {
          const newStock = currentStock + order.quantity;
          const updatedVariantStock = { ...variantStock, [variantStockKey]: newStock };

          await supabase
            .from('products')
            .update({ variant_stock: updatedVariantStock })
            .eq('id', order.product_id);
        }
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ is_canceled: true })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to cancel order');
    } else {
      toast.success('Order canceled successfully');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, is_canceled: true } : o));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md pb-24 md:pb-6">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2">
            <Package className="w-5 h-5" />
            Your Orders
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-sm">
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex gap-3">
                  <img
                    src={order.variant_image || '/placeholder.svg'}
                    alt={order.products.name}
                    className="w-20 h-20 object-contain rounded-lg bg-background"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{order.products.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {order.products.brand} {order.products.model}
                    </p>
                    {order.variants && Object.keys(order.variants).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(order.variants).map(([key, value]) => (
                          <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">
                      ₹{order.products.price.toLocaleString('en-IN')} × {order.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{order.shop_name}</p>
                    <p className="text-muted-foreground">{order.shop_address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={order.is_canceled ? 'destructive' : order.is_delivered ? 'default' : 'secondary'} className="text-xs">
                    {order.is_canceled ? 'Canceled' : order.is_delivered ? 'Delivered' : 'Pending'}
                  </Badge>
                  {!order.is_delivered && !order.is_canceled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelOrder(order.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default OrdersDrawer;
