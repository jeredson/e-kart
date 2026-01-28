import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import OrderSuccessPopup from '@/components/OrderSuccessPopup';

const Checkout = () => {
  const { user } = useAuth();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCheckoutItems();
    }
  }, [user]);

  const loadCheckoutItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      const items = data.map(item => ({
        id: item.product_id,
        name: item.product_name,
        description: item.product_description || '',
        price: item.product_price,
        image: item.variant_image || item.product_image || '',
        category: item.product_category || 'General',
        rating: item.product_rating || 4.5,
        reviews: item.product_reviews || 0,
        quantity: item.quantity,
        variants: item.variants ? (typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants) : {},
      }));
      setCheckoutItems(items);
    }
    setIsLoading(false);
  };

  const getProductDetails = (productId: string) => {
    return products?.find(p => p.id === productId);
  };

  const getProductSpecs = (productId: string) => {
    const product = getProductDetails(productId);
    if (!product?.specifications) return null;
    
    const specs = product.specifications as Record<string, unknown>;
    if (specs._ordered && Array.isArray(specs._ordered)) {
      const result: Record<string, unknown> = {};
      specs._ordered.forEach((spec: any) => {
        result[spec.key] = spec.values;
      });
      return result;
    }
    return specs;
  };

  const getAllSpecifications = (productId: string) => {
    const specs = getProductSpecs(productId);
    const allSpecs: Record<string, string> = {};
    
    if (specs) {
      Object.entries(specs).forEach(([key, value]) => {
        if (key === '_ordered') return;
        if (Array.isArray(value) && value.length > 0) {
          allSpecs[key] = value[0].value;
        } else if (typeof value === 'string') {
          allSpecs[key] = value;
        }
      });
    }
    
    return allSpecs;
  };

  const getVariantStock = (productId: string, variants: Record<string, string>) => {
    const product = getProductDetails(productId);
    if (!product?.variant_stock) return null;

    const variantStock = product.variant_stock as Record<string, number>;
    const availableKeys = Object.keys(variantStock);
    
    for (const key of availableKeys) {
      const keyParts = key.split(' | ');
      const keyVariants: Record<string, string> = {};
      
      keyParts.forEach(part => {
        const [variantType, variantValue] = part.split(': ');
        if (variantType && variantValue) {
          keyVariants[variantType.toLowerCase()] = variantValue;
        }
      });
      
      const allMatch = Object.entries(variants).every(([type, value]) => 
        keyVariants[type.toLowerCase()] === value
      );
      
      if (allMatch && Object.keys(variants).length === Object.keys(keyVariants).length) {
        return variantStock[key];
      }
    }
    
    return null;
  };

  const getVariantPrice = (productId: string, variants: Record<string, string>) => {
    const product = getProductDetails(productId);
    if (!product?.variant_pricing) return Number(product?.price || 0);

    const variantPricing = product.variant_pricing as Record<string, any>;
    if (!variantPricing.variants) return Number(product.price);

    const ramValue = variants['Ram'] || variants['RAM'];
    const storageValue = variants['Storage'] || variants['STORAGE'];
    
    if (ramValue && storageValue) {
      const variantKey = `${ramValue}_${storageValue}`;
      if (variantPricing.variants[variantKey]) {
        return variantPricing.variants[variantKey];
      }
    }

    return Number(product.price);
  };

  const totalPrice = checkoutItems.reduce((sum, item) => {
    const variantPrice = getVariantPrice(item.id, item.variants || {});
    return sum + variantPrice * item.quantity;
  }, 0);

  const handleQuantityChange = (productId: string, variants: Record<string, string>, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(productId, variants);
      return;
    }

    const maxStock = getVariantStock(productId, variants);
    if (maxStock && newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    const variantsJson = JSON.stringify(variants);
    
    // Update local state immediately
    setCheckoutItems(prev => prev.map(item => 
      item.id === productId && JSON.stringify(item.variants || {}) === variantsJson
        ? { ...item, quantity: newQuantity }
        : item
    ));

    // Update database in background
    if (user) {
      supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variants', variantsJson)
        .then(({ error }) => {
          if (error) {
            toast.error('Failed to update quantity');
          }
        });
    }
  };

  const handleRemove = (productId: string, variants?: Record<string, string>) => {
    const variantsJson = JSON.stringify(variants || {});
    
    // Update local state immediately
    setCheckoutItems(prev => prev.filter(item => 
      !(item.id === productId && JSON.stringify(item.variants || {}) === variantsJson)
    ));

    // Delete from database in background
    if (user) {
      supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('variants', variantsJson)
        .then(({ error }) => {
          if (error) {
            toast.error('Failed to remove item');
          }
        });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    // Get shop details from user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('shop_name, shop_address')
      .eq('id', user.id)
      .single();

    const userShopName = profile?.shop_name || '';
    const userShopAddress = profile?.shop_address || '';

    if (!userShopName || !userShopAddress) {
      toast.error('Please update your shop details in Settings first');
      return;
    }

    try {
      // Update stock for each item
      for (const item of checkoutItems) {
        const product = getProductDetails(item.id);
        if (product?.variant_stock) {
          // Sort keys to match database format (Color, Ram, Storage)
          const sortedEntries = Object.entries(item.variants || {}).sort(([keyA], [keyB]) => {
            const order = ['Color', 'COLOR', 'Ram', 'RAM', 'Storage', 'STORAGE'];
            const indexA = order.findIndex(k => k.toLowerCase() === keyA.toLowerCase());
            const indexB = order.findIndex(k => k.toLowerCase() === keyB.toLowerCase());
            return indexA - indexB;
          });
          
          const variantStockKey = sortedEntries
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ');
          
          console.log('Checkout - Item variants:', item.variants);
          console.log('Checkout - Variant stock key:', variantStockKey);
          console.log('Checkout - Available stock keys:', Object.keys(product.variant_stock));
          
          const variantStock = product.variant_stock as Record<string, number>;
          const currentStock = variantStock[variantStockKey];
          
          console.log('Checkout - Current stock:', currentStock);
          
          if (currentStock !== undefined) {
            const newStock = Math.max(0, currentStock - item.quantity);
            const updatedVariantStock = { ...variantStock, [variantStockKey]: newStock };
            
            console.log('Checkout - Updating stock from', currentStock, 'to', newStock);
            const { error: stockError } = await supabase
              .from('products')
              .update({ variant_stock: updatedVariantStock })
              .eq('id', item.id);
            
            if (stockError) {
              console.error('Checkout - Stock update error:', stockError);
            } else {
              console.log('Checkout - Stock updated successfully');
              queryClient.invalidateQueries({ queryKey: ['products'] });
            }
          } else {
            console.error('Checkout - Stock key not found! Key:', variantStockKey);
          }
        }
      }

      const orders = checkoutItems.map(item => {
        const variantPrice = getVariantPrice(item.id, item.variants || {});
        return {
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          price: variantPrice,
          variants: item.variants || {},
          variant_image: item.image,
          shop_name: userShopName,
          shop_address: userShopAddress,
          is_delivered: false,
          batch_id: crypto.randomUUID() // Same batch_id for all cart items
        };
      });

      // Use the same batch_id for all orders from this checkout
      const batchId = crypto.randomUUID();
      orders.forEach(order => order.batch_id = batchId);

      const { error } = await supabase.from('orders').insert(orders);

      if (error) throw error;

      // Send order notification to Zapier
      try {
        console.log('📧 Sending order notification to Zapier...');
        const webhookData = {
          batch_id: batchId,
          user_id: user.id,
          shop_name: userShopName,
          shop_address: userShopAddress,
          total_items: checkoutItems.length,
          total_amount: totalPrice,
          orders: orders.map(o => ({
            product_id: o.product_id,
            quantity: o.quantity,
            price: o.price,
            variants: o.variants
          })),
          ordered_at: new Date().toISOString()
        };
        
        await fetch('https://hooks.zapier.com/hooks/catch/26132431/ulyrew2/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...webhookData,
            event_type: 'order_placed'
          })
        });
        
        console.log('✅ Order notification sent to Zapier');
      } catch (webhookError) {
        console.error('❌ Webhook error:', webhookError);
      }

      await supabase.from('cart_items').delete().eq('user_id', user.id);

      setShowSuccessPopup(true);
      
      // Invalidate products cache to refresh stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      const isMobile = window.innerWidth < 1024;
      setTimeout(() => {
        navigate('/');
      }, isMobile ? 1000 : 3000);
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to checkout</h2>
        <Link to="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/', { state: { fromCheckout: true } })}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/', { state: { fromCheckout: true } })}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {checkoutItems.map((item) => {
            const product = getProductDetails(item.id);
            const variantStock = getVariantStock(item.id, item.variants || {});
            const variantPrice = getVariantPrice(item.id, item.variants || {});
            const specs = getProductSpecs(item.id);
            const allSpecs = getAllSpecifications(item.id);
            const displaySpecs = { ...allSpecs, ...item.variants };

            return (
              <Card key={`${item.id}-${JSON.stringify(item.variants)}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-lg bg-secondary mx-auto sm:mx-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                      </div>
                      
                      {/* All Specifications Display */}
                      {displaySpecs && Object.keys(displaySpecs).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {Object.entries(displaySpecs).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Variant Selection Dropdowns */}
                      {specs && Object.keys(specs).length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {Object.entries(specs).map(([key, value]) => {
                            if (key === '_ordered' || !Array.isArray(value)) return null;
                            return (
                              <div key={key}>
                                <Label className="text-xs mb-1">{key}</Label>
                                <Select
                                  value={item.variants?.[key] || ''}
                                  onValueChange={(newValue) => {
                                    const newVariants = { ...item.variants, [key]: newValue };
                                    const oldVariantsJson = JSON.stringify(item.variants || {});
                                    const newVariantsJson = JSON.stringify(newVariants);
                                    
                                    // Find the new variant image if color is changed
                                    let newVariantImage = item.image;
                                    if (key.toLowerCase().includes('color')) {
                                      const selectedOption = value.find((opt: any) => opt.value === newValue);
                                      if (selectedOption?.image) {
                                        newVariantImage = selectedOption.image;
                                      }
                                    }
                                    
                                    const variantPrice = getVariantPrice(item.id, newVariants);
                                    
                                    // Update local state immediately
                                    setCheckoutItems(prev => prev.map(cartItem => 
                                      cartItem.id === item.id && JSON.stringify(cartItem.variants) === oldVariantsJson
                                        ? { ...cartItem, variants: newVariants, image: newVariantImage, price: variantPrice }
                                        : cartItem
                                    ));
                                    
                                    // Update database in background
                                    if (user) {
                                      supabase
                                        .from('cart_items')
                                        .update({ 
                                          variants: newVariantsJson,
                                          variant_image: newVariantImage,
                                          product_price: variantPrice
                                        })
                                        .eq('user_id', user.id)
                                        .eq('product_id', item.id)
                                        .eq('variants', oldVariantsJson)
                                        .then(({ error }) => {
                                          if (error) {
                                            toast.error('Failed to update variant');
                                          }
                                        });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {value.map((option: any, idx: number) => (
                                      <SelectItem key={idx} value={option.value} className="text-xs">
                                        {option.value}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <span className="font-bold text-lg sm:text-xl">₹{variantPrice.toLocaleString('en-IN')}</span>
                          {variantStock !== null && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {variantStock} available
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleQuantityChange(item.id, item.variants || {}, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-medium text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleQuantityChange(item.id, item.variants || {}, item.quantity + 1)}
                            disabled={variantStock !== null && item.quantity >= variantStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleRemove(item.id, item.variants)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    <OrderSuccessPopup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} />
    </>
  );
};

export default Checkout;