import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Package, ArrowLeft, CalendarIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  variants: Record<string, string>;
  variant_image: string | null;
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [shops, setShops] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;
    
    if (shopFilter !== 'all') {
      filtered = filtered.filter(o => o.shop_name === shopFilter);
    }
    
    if (dateFilter === 'custom' && selectedDate) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.toDateString() === selectedDate.toDateString();
      });
    } else if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.created_at);
        const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }
    
    setFilteredOrders(filtered);
  }, [shopFilter, dateFilter, selectedDate, orders]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
      return;
    }

    if (data) {
      console.log('Raw order data:', data[0]);
      // Fetch product details and user emails separately
      const ordersWithDetails = await Promise.all(
        data.map(async (order) => {
          const { data: product } = await supabase
            .from('products')
            .select('name, image, price')
            .eq('id', order.product_id)
            .single();

          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', order.user_id)
            .single();

          return {
            ...order,
            product: product || { name: 'Unknown Product', image: '', price: 0 },
            user_email: profile?.email || 'N/A'
          };
        })
      );
      console.log('Order with details:', ordersWithDetails[0]);
      setOrders(ordersWithDetails as Order[]);
      const uniqueShops = [...new Set(ordersWithDetails.map(o => o.shop_name))];
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

  const deleteOrder = async (orderId: string) => {
    if (!selectedOrder) return;

    // Restock the product variant
    const { data: product } = await supabase
      .from('products')
      .select('variant_stock')
      .eq('id', selectedOrder.product_id)
      .single();

    if (product?.variant_stock && !selectedOrder.is_delivered) {
      const sortedEntries = Object.entries(selectedOrder.variants).sort(([keyA], [keyB]) => {
        const order = ['Ram', 'RAM', 'Color', 'COLOR', 'Storage', 'STORAGE'];
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
        const newStock = currentStock + selectedOrder.quantity;
        const updatedVariantStock = { ...variantStock, [variantStockKey]: newStock };

        await supabase
          .from('products')
          .update({ variant_stock: updatedVariantStock })
          .eq('id', selectedOrder.product_id);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (date) {
                    setDateFilter('custom');
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={dateFilter} onValueChange={(value) => {
            setDateFilter(value);
            if (value !== 'custom') setSelectedDate(undefined);
          }}>
            <SelectTrigger className="w-32 sm:w-36">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              {selectedDate && <SelectItem value="custom">{format(selectedDate, 'PP')}</SelectItem>}
            </SelectContent>
          </Select>
          <Select value={shopFilter} onValueChange={setShopFilter}>
            <SelectTrigger className="w-32 sm:w-48">
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
                src={order.variant_image || order.product.image}
                alt={order.product.name}
                className="w-20 h-20 object-contain rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2">{order.product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{order.shop_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
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
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={selectedOrder.variant_image || selectedOrder.product.image}
                  alt={selectedOrder.product.name}
                  className="w-24 h-24 object-contain rounded mx-auto sm:mx-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold">{selectedOrder.product.name}</h3>
                  <p className="text-sm text-muted-foreground break-all">{selectedOrder.user_email}</p>
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
                    <p className="text-sm break-words">{Object.entries(selectedOrder.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">Shop Name</p>
                  <p className="text-sm break-words">{selectedOrder.shop_name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Shop Address</p>
                  <p className="text-sm break-words">{selectedOrder.shop_address}</p>
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
              <Button 
                onClick={() => deleteOrder(selectedOrder.id)} 
                variant="destructive" 
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Order
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
