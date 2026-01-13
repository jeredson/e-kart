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
  removeFromCart: (productId: string, variants?: Record<string, string>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variants?: Record<string, string>) => Promise<void>;
  clearCart: () => Promise<void>;
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
      console.log('Raw cart data:', data);
      const cartItems: CartItem[] = data?.map(item => {
        let variants = {};
        try {
          variants = item.variants ? (typeof item.variants === 'string' ? JSON.parse(item.variants) : item.variants) : {};
        } catch (e) {
          console.error('Error parsing variants:', e, item.variants);
          variants = {};
        }
        
        const cartItem = {
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
        console.log('Processed cart item:', cartItem);
        return cartItem;
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

    console.log('Adding to cart:', { product, variants, variantImage });

    const variantKey = JSON.stringify(variants);
    const existing = items.find(item => 
      item.id === product.id && JSON.stringify(item.variants || {}) === variantKey
    );
    
    if (existing) {
      await updateQuantity(product.id, existing.quantity + 1, variants);
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
        variants: Object.keys(variants).length > 0 ? JSON.stringify(variants) : null,
        variant_image: variantImage
      };

      console.log('Inserting cart item:', cartItem);

      const { error } = await supabase
        .from('cart_items')
        .insert(cartItem);

      if (error) {
        console.error('Cart insert error:', error);
        toast.error('Failed to add item to cart');
      } else {
        const newItem = { 
          ...product, 
          quantity: 1, 
          variants, 
          variantImage,
          image: variantImage || product.image
        };
        console.log('Added to cart successfully:', newItem);
        setItems([...items, newItem]);
        toast.success('Added to cart!');
      }
    }
  };

  const removeFromCart = async (productId: string, variants: Record<string, string> = {}) => {
    if (!user) return;

    const variantsJson = Object.keys(variants).length > 0 ? JSON.stringify(variants) : null;
    console.log('Removing from cart:', { productId, variants, variantsJson });

    // First, let's see what's actually in the database
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId);
    
    console.log('Existing cart items for product:', existingItems);

    let query = supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (variantsJson === null) {
      query = query.is('variants', null);
    } else {
      query = query.eq('variants', variantsJson);
    }

    const { error, count } = await query;

    console.log('Delete result:', { error, count });

    if (error) {
      console.error('Remove from cart error:', error);
      toast.error('Failed to remove item from cart');
    } else {
      console.log('Successfully deleted from database, updating UI');
      const variantKey = JSON.stringify(variants);
      const newItems = items.filter(item => {
        const itemVariantKey = JSON.stringify(item.variants || {});
        const shouldRemove = item.id === productId && itemVariantKey === variantKey;
        console.log('Item check:', { itemId: item.id, productId, itemVariantKey, variantKey, shouldRemove });
        return !shouldRemove;
      });
      console.log('Updated items:', newItems.length, 'vs original:', items.length);
      setItems(newItems);
      toast.success('Removed from cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variants: Record<string, string> = {}) => {
    if (!user) return;
    
    if (quantity <= 0) {
      await removeFromCart(productId, variants);
      return;
    }

    const variantsJson = Object.keys(variants).length > 0 ? JSON.stringify(variants) : null;
    console.log('Updating quantity:', { productId, quantity, variants, variantsJson });

    let query = supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (variantsJson === null) {
      query = query.is('variants', null);
    } else {
      query = query.eq('variants', variantsJson);
    }

    const { error } = await query;

    if (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } else {
      const variantKey = JSON.stringify(variants);
      setItems(items.map(item => {
        const itemVariantKey = JSON.stringify(item.variants || {});
        return item.id === productId && itemVariantKey === variantKey
          ? { ...item, quantity } 
          : item;
      }));
    }
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
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reloadCart,
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
