import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
  variants?: Record<string, string>;
  variantImage?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variants?: Record<string, string>, variantImage?: string) => Promise<void>;
  removeFromCart: (productId: string, variants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variants?: Record<string, string>) => void;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cart:', error);
    } else {
      const cartItems: CartItem[] = data?.map(item => {
        let variants = {};
        try {
          variants = item.variants ? (typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants) : {};
        } catch (e) {
          console.error('Error parsing variants:', e, item.variants);
          variants = {};
        }
        
        return {
          id: item.product_id,
          name: item.product_name,
          description: item.product_description || '',
          price: item.product_price,
          image: item.variant_image || item.product_image || '',
          category: item.product_category || 'General',
          rating: item.product_rating || 4.5,
          reviews: item.product_reviews || 0,
          quantity: item.quantity,
          variants,
          variantImage: item.variant_image
        };
      }) || [];
      setItems(cartItems);
    }
    setIsLoading(false);
  };

  const addToCart = async (product: Product, variants: Record<string, string> = {}, variantImage?: string) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    const variantKey = JSON.stringify(variants);
    const existing = items.find(item => 
      item.id === product.id && JSON.stringify(item.variants || {}) === variantKey
    );
    
    if (existing) {
      // Update local state immediately
      setItems(items.map(item => 
        item.id === product.id && JSON.stringify(item.variants || {}) === variantKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      
      // Update database in background
      supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('variants', variantKey)
        .then(({ error }) => {
          if (error) {
            console.error('Cart update error:', error);
            toast.error('Failed to update cart');
          }
        });
    } else {
      const cartItem = {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_description: product.description,
        product_price: product.price,
        product_image: product.image,
        product_category: product.category,
        product_rating: product.rating,
        product_reviews: product.reviews,
        quantity: 1,
        variants: variantKey,
        variant_image: variantImage
      };

      // Add to local state immediately
      const newItem = { 
        ...product, 
        quantity: 1, 
        variants, 
        variantImage,
        image: variantImage || product.image
      };
      setItems([...items, newItem]);

      // Insert to database in background
      supabase
        .from('cart_items')
        .insert(cartItem)
        .then(({ error }) => {
          if (error) {
            console.error('Cart insert error:', error);
            toast.error('Failed to add item to cart');
          } else {
            toast.success('Added to cart!');
          }
        });
    }
  };

  const removeFromCart = (productId: string, variants: Record<string, string> = {}) => {
    if (!user) return;

    const variantsJson = JSON.stringify(variants);
    
    // Update local state immediately
    setItems(items.filter(item => 
      !(item.id === productId && JSON.stringify(item.variants || {}) === variantsJson)
    ));

    // Delete from database in background
    supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('variants', variantsJson)
      .then(({ error }) => {
        if (error) {
          console.error('Remove from cart error:', error);
          toast.error('Failed to remove item from cart');
        } else {
          toast.success('Removed from cart');
        }
      });
  };

  const updateQuantity = (productId: string, quantity: number, variants: Record<string, string> = {}) => {
    if (!user) return;
    
    if (quantity <= 0) {
      removeFromCart(productId, variants);
      return;
    }

    const variantsJson = JSON.stringify(variants);
    
    // Update local state immediately
    setItems(items.map(item => {
      const itemVariantKey = JSON.stringify(item.variants || {});
      return item.id === productId && itemVariantKey === variantsJson
        ? { ...item, quantity } 
        : item;
    }));

    // Update database in background
    supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('variants', variantsJson)
      .then(({ error }) => {
        if (error) {
          console.error('Update quantity error:', error);
          toast.error('Failed to update quantity');
        }
      });
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to clear cart');
    } else {
      setItems([]);
      toast.success('Cart cleared');
    }
  };

  // Add a function to force reload cart from database
  const reloadCart = async () => {
    await loadCart();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
        totalItems,
        totalPrice,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
