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

interface GroupedOrders {
  date: string;
  user_id: string;
  user_email: string;
  orders: Order[];
  totalItems: number;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupedOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupedOrders | null>(null);
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [shops, setShops] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = groupedOrders;
    
    if (shopFilter !== 'all') {
      filtered = filtered.filter(g => g.orders.some(o => o.shop_name === shopFilter));
    }
    
    if (dateFilter === 'custom' && selectedDate) {
      const targetDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      filtered = filtered.filter(g => g.date === targetDate);
    } else if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(g => {
        const groupDate = new Date(g.orders[0].created_at);
        const diffDays = Math.floor((now.getTime() - groupDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case 'today': return diffDays === 0;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }
    
    setFilteredGroups(filtered);
  }, [shopFilter, dateFilter, selectedDate, groupedOrders]);

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
      
      // Group orders by date and user
      const grouped = ordersWithDetails.reduce((acc, order) => {
        const orderDate = new Date(order.created_at);
        const date = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}/${orderDate.getFullYear()}`;
        const key = `${date}_${order.user_id}`;
        const existing = acc.find(g => g.date === date && g.user_id === order.user_id);
        if (existing) {
          existing.orders.push(order);
          existing.totalItems += order.quantity;
        } else {
          acc.push({ 
            date, 
            user_id: order.user_id,
            user_email: order.user_email,
            orders: [order], 
            totalItems: order.quantity 
          });
        }
        return acc;
      }, [] as GroupedOrders[]);
      // Sort by most recent first
      grouped.sort((a, b) => new Date(b.orders[0].created_at).getTime() - new Date(a.orders[0].created_at).getTime());
      setGroupedOrders(grouped);
      
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
    }
  };

  const deleteOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const { data: product } = await supabase
      .from('products')
      .select('variant_stock')
      .eq('id', order.product_id)
      .single();

    if (product?.variant_stock && !order.is_delivered) {
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
        {filteredGroups.map((group, idx) => (
          <Card
            key={idx}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedGroup(group)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{group.orders[0].shop_name}</h3>
                <p className="text-xs text-muted-foreground truncate">{group.date}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{group.totalItems} item{group.totalItems > 1 ? 's' : ''}</span>
              </div>
              <Badge variant={group.orders.every(o => o.is_delivered) ? 'default' : 'secondary'}>
                {group.orders.every(o => o.is_delivered) ? 'Delivered' : 'Pending'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div>
                <div>Orders from {selectedGroup?.date}</div>
                <div className="text-sm font-normal text-muted-foreground">{selectedGroup?.user_email}</div>
              </div>
            </DialogTitle>
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
                      <p className="text-xs text-muted-foreground">{order.shop_address}</p>
                      <p className="text-sm font-bold mt-1">₹{(order.product.price * order.quantity).toLocaleString('en-IN')}</p>
                      <p className="text-sm mt-1">Qty: {order.quantity}</p>
                      {Object.keys(order.variants).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(order.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={order.is_delivered ? 'default' : 'secondary'}>
                          {order.is_delivered ? 'Delivered' : 'Pending'}
                        </Badge>
                        {!order.is_delivered && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsDelivered(order.id);
                              }}
                            >
                              <Package className="w-4 h-4 mr-1" />
                              Deliver
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteOrder(order.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Subtotal:</span>
                  <span className="text-lg font-bold text-primary">
                    ₹{selectedGroup.orders.reduce((sum, order) => sum + (order.product.price * order.quantity), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
