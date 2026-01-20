import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
  variant_image: string | null;
  shop_name: string;
  is_delivered: boolean;
  created_at: string;
  product: {
    name: string;
    image: string;
    price: number;
  };
}

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const ordersWithProducts = await Promise.all(
        data.map(async (order) => {
          const { data: product } = await supabase
            .from('products')
            .select('name, image, price')
            .eq('id', order.product_id)
            .single();

          return {
            ...order,
            product: product || { name: 'Unknown Product', image: '', price: 0 }
          };
        })
      );
      setOrders(ordersWithProducts as Order[]);
    }
    setLoading(false);
  };

  const deleteOrder = async (orderId: string) => {
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
      .delete()
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to delete order');
    } else {
      toast.success('Order deleted successfully');
      loadOrders();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex gap-3">
                <img
                  src={order.variant_image || order.product.image}
                  alt={order.product.name}
                  className="w-20 h-20 object-contain rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2">{order.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{order.shop_name}</p>
                  <p className="text-sm font-bold mt-1">Qty: {order.quantity}</p>
                  {Object.keys(order.variants).length > 0 && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {Object.values(order.variants).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={order.is_delivered ? 'default' : 'secondary'}>
                      {order.is_delivered ? 'Delivered' : 'Processing'}
                    </Badge>
                    {!order.is_delivered && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteOrder(order.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
