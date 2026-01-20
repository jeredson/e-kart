import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DbProduct } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Plus, Minus } from 'lucide-react';

interface BuyNowSheetProps {
  product: DbProduct | null;
  isOpen: boolean;
  onClose: () => void;
  initialVariants: Record<string, string>;
  initialImage: string;
}

const BuyNowSheet = ({ product, isOpen, onClose, initialVariants, initialImage }: BuyNowSheetProps) => {
  const { user } = useAuth();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(initialVariants);
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    setSelectedVariants(initialVariants);
    setSelectedImage(initialImage);
    setQuantity(1);
    setQuantityInput('1');
  }, [initialVariants, initialImage]);

  useEffect(() => {
    if (user && isOpen) {
      loadUserProfile();
    }
  }, [user, isOpen]);

  const loadUserProfile = async () => {
    if (!user) return;
    setLoadingProfile(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('shop_name, shop_address')
      .eq('id', user.id)
      .single();

    if (data) {
      setShopName(data.shop_name || '');
      setShopAddress(data.shop_address || '');
    }
    setLoadingProfile(false);
  };

  const handleQuantityChange = (value: string) => {
    setQuantityInput(value);
    
    if (value === '' || value === '0') {
      setQuantity(0);
      return;
    }
    
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      const clamped = Math.min(maxStock || 999, num);
      setQuantity(clamped);
      if (clamped !== num) {
        setQuantityInput(clamped.toString());
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantityInput === '' || quantity === 0) {
      setQuantity(1);
      setQuantityInput('1');
    }
  };

  if (!product) return null;

  const specs = product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)
    ? product.specifications as Record<string, unknown>
    : null;

  const orderedSpecs = (() => {
    if (!specs) return null;
    if (specs._ordered && Array.isArray(specs._ordered)) {
      const result: Record<string, unknown> = {};
      specs._ordered.forEach((spec: any) => {
        result[spec.key] = spec.values;
      });
      return result;
    }
    return specs;
  })();

  const isColorSpec = (key: string) => key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');

  const getPrice = () => {
    const variantPricing = product.variant_pricing as Record<string, any> | null;
    if (!variantPricing?.variants) return Number(product.price);

    const pricingVariants: Record<string, string> = {};
    Object.entries(selectedVariants).forEach(([key, value]) => {
      if (!isColorSpec(key)) pricingVariants[key] = value;
    });

    const ramValue = pricingVariants['Ram'] || pricingVariants['RAM'];
    const storageValue = pricingVariants['Storage'] || pricingVariants['STORAGE'];
    
    if (ramValue && storageValue) {
      const variantKey = `${ramValue}_${storageValue}`;
      if (variantPricing.variants[variantKey]) return variantPricing.variants[variantKey];
    }
    return Number(product.price);
  };

  const getVariantStock = () => {
    const variantStock = product.variant_stock as Record<string, number> | null;
    if (!variantStock) return null;

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
      
      const allMatch = Object.entries(selectedVariants).every(([type, value]) => 
        keyVariants[type.toLowerCase()] === value
      );
      
      if (allMatch && Object.keys(selectedVariants).length === Object.keys(keyVariants).length) {
        return variantStock[key];
      }
    }
    return null;
  };

  const handleVariantChange = (specKey: string, value: string) => {
    setSelectedVariants(prev => ({ ...prev, [specKey]: value }));
    
    if (orderedSpecs && Array.isArray(orderedSpecs[specKey])) {
      const selectedOption = (orderedSpecs[specKey] as any[]).find((item: any) => item.value === value);
      if (selectedOption?.image) {
        setSelectedImage(selectedOption.image);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      return;
    }

    if (!shopName.trim() || !shopAddress.trim()) {
      toast.error('Please add shop details in your profile settings');
      return;
    }

    // Validate quantity against stock
    if (maxStock !== null && quantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock for this variant`);
      return;
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setLoading(true);
    console.log('Placing order with image:', selectedImage);
    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      product_id: product.id,
      quantity,
      variants: selectedVariants,
      variant_image: selectedImage || product.image,
      shop_name: shopName.trim(),
      shop_address: shopAddress.trim(),
    });

    setLoading(false);
    if (error) {
      toast.error('Failed to place order');
      console.error(error);
    } else {
      toast.success('Order placed successfully!');
      onClose();
      setQuantity(1);
    }
  };

  const currentPrice = getPrice();
  const maxStock = getVariantStock();
  const variantExceptions = product.variant_exceptions as string[] | null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Buy Now</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex gap-4">
            <img
              src={selectedImage || product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-24 h-24 object-contain rounded border"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-2xl font-bold mt-2">₹{currentPrice.toLocaleString('en-IN')}</p>
              {maxStock !== null && (
                <p className="text-sm text-muted-foreground mt-1">{maxStock} available</p>
              )}
            </div>
          </div>

          {orderedSpecs && Object.keys(orderedSpecs).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Specifications</h4>
              {Object.entries(orderedSpecs).map(([key, value]) => {
                if (key === '_ordered') return null;
                
                if (Array.isArray(value)) {
                  return (
                    <div key={key}>
                      <Label className="text-sm mb-2 block">{key}</Label>
                      <Select
                        value={selectedVariants[key] || ''}
                        onValueChange={(val) => handleVariantChange(key, val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${key}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {value.map((item: any, idx: number) => {
                            const testVariants = { ...selectedVariants, [key]: item.value };
                            const pricingVariants: string[] = [];
                            Object.entries(testVariants).forEach(([k, v]) => {
                              if (!isColorSpec(k)) pricingVariants.push(v);
                            });
                            const variantKey = pricingVariants.join('_');
                            const isException = variantExceptions?.includes(variantKey) || variantExceptions?.includes(item.value);
                            
                            return (
                              <SelectItem key={idx} value={item.value} disabled={isException}>
                                {item.value} {isException && '(N/A)'}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className="flex justify-between p-2 bg-secondary rounded">
                      <Label className="text-sm text-muted-foreground">{key}</Label>
                      <span className="text-sm font-medium">{String(value)}</span>
                    </div>
                  );
                }
              })}
            </div>
          )}

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const newQty = Math.max(1, quantity - 1);
                  setQuantity(newQty);
                  setQuantityInput(newQty.toString());
                }}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="text"
                value={quantityInput}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={handleQuantityBlur}
                className="text-center"
                placeholder="0"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const newQty = Math.min(maxStock || 999, quantity + 1);
                  setQuantity(newQty);
                  setQuantityInput(newQty.toString());
                }}
                disabled={maxStock !== null && quantity >= maxStock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {maxStock !== null && (
              <p className="text-xs text-muted-foreground mt-1">Max: {maxStock}</p>
            )}
          </div>

          {loadingProfile ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 p-3 bg-secondary rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Shop Name</Label>
                <p className="text-sm font-medium">{shopName || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Shop Address</Label>
                <p className="text-sm font-medium">{shopAddress || 'Not set'}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span>₹{(currentPrice * quantity).toLocaleString('en-IN')}</span>
            </div>
            <Button
              onClick={handleBuyNow}
              disabled={loading || loadingProfile || !shopName.trim() || !shopAddress.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {!shopName.trim() || !shopAddress.trim() ? 'Update Profile to Continue' : 'Place Order'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BuyNowSheet;
