import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
  shop_name: string;
  shop_address: string;
  is_delivered: boolean;
  created_at: string;
  product: {
    name: string;
    image: string;
    price: number;
  };
  user_email: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [shops, setShops] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (shopFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.shop_name === shopFilter));
    }
  }, [shopFilter, orders]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, product:products(name, image, price)')
      .order('created_at', { ascending: false });

    if (data) {
      const ordersWithEmail = await Promise.all(
        data.map(async (order) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(order.user_id);
          return { ...order, user_email: user?.email || 'N/A' };
        })
      );
      setOrders(ordersWithEmail as Order[]);
      const uniqueShops = [...new Set(ordersWithEmail.map(o => o.shop_name))];
      setShops(uniqueShops);
    }
    setLoading(false);
  };

  const markAsDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_delivered: true })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order marked as delivered');
      loadOrders();
      setSelectedOrder(null);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <Select value={shopFilter} onValueChange={setShopFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by shop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shops</SelectItem>
            {shops.map(shop => (
              <SelectItem key={shop} value={shop}>{shop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedOrder(order)}
          >
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
                <Badge className="mt-2" variant={order.is_delivered ? 'default' : 'secondary'}>
                  {order.is_delivered ? 'Delivered' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedOrder.product.image}
                  alt={selectedOrder.product.name}
                  className="w-24 h-24 object-contain rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedOrder.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user_email}</p>
                  <p className="text-lg font-bold mt-2">
                    ₹{(selectedOrder.product.price * selectedOrder.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold">Quantity</p>
                  <p className="text-sm">{selectedOrder.quantity}</p>
                </div>
                {Object.keys(selectedOrder.variants).length > 0 && (
                  <div>
                    <p className="text-sm font-semibold">Variants</p>
                    <p className="text-sm">{Object.entries(selectedOrder.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">Shop Name</p>
                  <p className="text-sm">{selectedOrder.shop_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Shop Address</p>
                  <p className="text-sm">{selectedOrder.shop_address}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Order Date</p>
                  <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <Badge variant={selectedOrder.is_delivered ? 'default' : 'secondary'}>
                    {selectedOrder.is_delivered ? 'Delivered' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {!selectedOrder.is_delivered && (
                <Button onClick={() => markAsDelivered(selectedOrder.id)} className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
