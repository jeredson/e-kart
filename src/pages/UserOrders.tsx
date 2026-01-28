import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X, Package, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
  variant_image: string | null;
  shop_name: string;
  is_delivered: boolean;
  is_canceled: boolean;
  created_at: string;
  product: {
    name: string;
    image: string;
    price: number;
  };
}

interface GroupedOrders {
  date: string;
  orders: Order[];
  totalItems: number;
}

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupedOrders | null>(null);
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
            is_canceled: order.is_canceled || false,
            product: product || { name: 'Unknown Product', image: '', price: 0 }
          };
        })
      );
      setOrders(ordersWithProducts as Order[]);
      
      // Group orders by date
      const grouped = ordersWithProducts.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existing = acc.find(g => g.date === date);
        if (existing) {
          existing.orders.push(order);
          existing.totalItems += order.quantity;
        } else {
          acc.push({ date, orders: [order], totalItems: order.quantity });
        }
        return acc;
      }, [] as GroupedOrders[]);
      setGroupedOrders(grouped);
    }
    setLoading(false);
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
      console.error('Cancel error:', error);
      toast.error('Failed to cancel order');
    } else {
      toast.success('Order canceled successfully');
      
      // Send notification to Zapier
      console.log('🔔 Sending webhook to Zapier...');
      try {
        const webhookData = {
          order_id: orderId,
          user_id: user?.id,
          product_id: order.product_id,
          quantity: order.quantity,
          shop_name: order.shop_name,
          cancelled_at: new Date().toISOString(),
          event_type: 'order_cancelled'
        };
        console.log('📤 Webhook data:', webhookData);
        
        const response = await fetch('https://hooks.zapier.com/hooks/catch/26132431/CANCEL_WEBHOOK_URL/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
        
        console.log('✅ Webhook response status:', response.status);
        console.log('✅ Webhook sent successfully!');
      } catch (webhookError) {
        console.error('❌ Webhook error:', webhookError);
        // Don't show error to user - order is still cancelled
      }
      
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
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Orders</h1>

      {groupedOrders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groupedOrders.map((group, idx) => (
            <Card 
              key={idx} 
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{group.date}</h3>
                  <p className="text-sm text-muted-foreground">{group.orders.length} order{group.orders.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{group.totalItems} item{group.totalItems > 1 ? 's' : ''}</span>
                </div>
                <Badge variant={group.orders.every(o => o.is_delivered) ? 'default' : 'secondary'}>
                  {group.orders.every(o => o.is_delivered) ? 'Delivered' : 'Processing'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orders from {selectedGroup?.date}</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              {selectedGroup.orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={order.variant_image || order.product.image}
                      alt={order.product.name}
                      className="w-20 h-20 object-contain rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{order.product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{order.shop_name}</p>
                      <p className="text-sm font-bold mt-1">₹{(order.product.price * order.quantity).toLocaleString('en-IN')}</p>
                      <p className="text-sm mt-1">Qty: {order.quantity}</p>
                      {Object.keys(order.variants).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(order.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={order.is_canceled ? 'destructive' : order.is_delivered ? 'default' : 'secondary'}>
                          {order.is_canceled ? 'Canceled' : order.is_delivered ? 'Delivered' : 'Processing'}
                        </Badge>
                        {!order.is_delivered && !order.is_canceled && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelOrder(order.id);
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserOrders;
