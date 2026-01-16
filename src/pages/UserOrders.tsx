import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
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
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(name, image, price)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
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
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex gap-3">
                <img
                  src={order.product.image}
                  alt={order.product.name}
                  className="w-20 h-20 object-contain rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2">{order.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{order.shop_name}</p>
                  <p className="text-sm font-bold mt-1">Qty: {order.quantity}</p>
                  {Object.keys(order.variants).length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Object.values(order.variants).join(', ')}
                    </p>
                  )}
                  <div className="mt-2">
                    <Badge variant={order.is_delivered ? 'default' : 'secondary'}>
                      {order.is_delivered ? 'Delivered' : 'Processing'}
                    </Badge>
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
