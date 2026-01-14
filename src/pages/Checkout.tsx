import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, ArrowLeft, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, addToCart } = useCart();
  const { user } = useAuth();
  const { data: products } = useProducts();
  const [checkoutItems, setCheckoutItems] = useState(items);
  const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<string | null>(null);
  const [newVariantSelections, setNewVariantSelections] = useState<Record<string, string>>({});
  const [newVariantQuantity, setNewVariantQuantity] = useState(1);

  useEffect(() => {
    setCheckoutItems(items);
  }, [items]);

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

  const handleQuantityChange = async (productId: string, variants: Record<string, string>, newQuantity: number) => {
    const maxStock = getVariantStock(productId, variants);
    if (maxStock && newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }
    await updateQuantity(productId, newQuantity, variants);
  };

  const handleAddVariant = async () => {
    if (!selectedProductForVariant) return;
    
    const product = getProductDetails(selectedProductForVariant);
    if (!product) return;

    const maxStock = getVariantStock(selectedProductForVariant, newVariantSelections);
    if (maxStock && newVariantQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    const variantPrice = getVariantPrice(selectedProductForVariant, newVariantSelections);
    
    // Get variant image based on color selection
    let variantImage = product.image;
    const specs = getProductSpecs(selectedProductForVariant);
    if (specs) {
      Object.entries(specs).forEach(([key, value]) => {
        if (key.toLowerCase().includes('color') && Array.isArray(value)) {
          const selectedColor = newVariantSelections[key];
          const colorOption = value.find((opt: any) => opt.value === selectedColor);
          if (colorOption?.image) {
            variantImage = colorOption.image;
          }
        }
      });
    }
    
    // Add to cart with quantity and variant image
    await addToCart({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: variantPrice,
      image: product.image || '',
      category: product.category?.name || 'General',
      rating: Number(product.rating) || 4.5,
      reviews: product.reviews_count || 0,
    }, newVariantSelections, variantImage);

    // Only update quantity if more than 1
    if (newVariantQuantity > 1) {
      const variantsJson = JSON.stringify(newVariantSelections);
      supabase
        .from('cart_items')
        .update({ quantity: newVariantQuantity })
        .eq('user_id', user?.id)
        .eq('product_id', product.id)
        .eq('variants', variantsJson);
    }

    toast.success('Variant added to cart!');
    setAddVariantDialogOpen(false);
    setSelectedProductForVariant(null);
    setNewVariantSelections({});
    setNewVariantQuantity(1);
  };

  const openAddVariantDialog = (productId: string) => {
    const specs = getProductSpecs(productId);
    const initialSelections: Record<string, string> = {};
    
    if (specs) {
      Object.entries(specs).forEach(([key, value]) => {
        if (key === '_ordered') return;
        if (Array.isArray(value) && value.length > 0) {
          initialSelections[key] = value[0].value;
        } else if (typeof value === 'string') {
          // Include single-value specs
          initialSelections[key] = value;
        }
      });
    }
    
    setSelectedProductForVariant(productId);
    setNewVariantSelections(initialSelections);
    setNewVariantQuantity(1);
    setAddVariantDialogOpen(true);
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

  if (checkoutItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
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
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-contain rounded-lg bg-secondary"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openAddVariantDialog(item.id)}
                          title="Add another variant"
                        >
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* All Specifications Display */}
                      {displaySpecs && Object.keys(displaySpecs).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {Object.entries(displaySpecs).map(([key, value]) => (
                            <Badge key={key} variant="secondary">
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
                                  onValueChange={async (newValue) => {
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
                                    
                                    // Update the cart item in database
                                    if (user) {
                                      const { error } = await supabase
                                        .from('cart_items')
                                        .update({ 
                                          variants: newVariantsJson,
                                          variant_image: newVariantImage,
                                          product_price: variantPrice
                                        })
                                        .eq('user_id', user.id)
                                        .eq('product_id', item.id)
                                        .eq('variants', oldVariantsJson);
                                      
                                      if (!error) {
                                        // Update local state
                                        setCheckoutItems(prev => prev.map(cartItem => 
                                          cartItem.id === item.id && JSON.stringify(cartItem.variants) === oldVariantsJson
                                            ? { ...cartItem, variants: newVariants, image: newVariantImage, price: variantPrice }
                                            : cartItem
                                        ));
                                        toast.success('Variant updated');
                                      }
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

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xl">₹{variantPrice.toLocaleString('en-IN')}</span>
                          {variantStock !== null && (
                            <p className="text-sm text-muted-foreground">
                              {variantStock} available
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.variants || {}, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.variants || {}, item.quantity + 1)}
                            disabled={variantStock !== null && item.quantity >= variantStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive ml-2"
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
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
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
              <Button className="w-full" size="lg">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Variant Dialog */}
      <Dialog open={addVariantDialogOpen} onOpenChange={setAddVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Variant</DialogTitle>
          </DialogHeader>
          {selectedProductForVariant && (() => {
            const product = getProductDetails(selectedProductForVariant);
            const specs = getProductSpecs(selectedProductForVariant);
            const maxStock = getVariantStock(selectedProductForVariant, newVariantSelections);
            
            return (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <img
                    src={product?.image || '/placeholder.svg'}
                    alt={product?.name}
                    className="w-16 h-16 object-contain rounded bg-secondary"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{product?.name}</h4>
                    <p className="text-sm font-bold text-primary">
                      ₹{getVariantPrice(selectedProductForVariant, newVariantSelections).toLocaleString('en-IN')}
                    </p>
                    {maxStock !== null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Stock: {maxStock} available
                      </p>
                    )}
                  </div>
                </div>

                {specs && Object.entries(specs).map(([key, value]) => {
                  if (key === '_ordered' || !Array.isArray(value)) return null;
                  return (
                    <div key={key}>
                      <Label>{key}</Label>
                      <Select
                        value={newVariantSelections[key] || ''}
                        onValueChange={(newValue) => {
                          setNewVariantSelections(prev => ({ ...prev, [key]: newValue }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {value.map((option: any, idx: number) => (
                            <SelectItem key={idx} value={option.value}>
                              {option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}

                {maxStock !== null && (
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <p className="text-sm font-medium">
                      Stock Available: <span className="text-primary font-bold">{maxStock} units</span>
                    </p>
                  </div>
                )}

                <div>
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNewVariantQuantity(Math.max(1, newVariantQuantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={newVariantQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setNewVariantQuantity(maxStock ? Math.min(val, maxStock) : val);
                      }}
                      className="w-20 text-center"
                      min={1}
                      max={maxStock || undefined}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNewVariantQuantity(maxStock ? Math.min(newVariantQuantity + 1, maxStock) : newVariantQuantity + 1)}
                      disabled={maxStock !== null && newVariantQuantity >= maxStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {maxStock !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {maxStock} available in stock
                    </p>
                  )}
                </div>

                <Button onClick={handleAddVariant} className="w-full">
                  Add to Cart
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;