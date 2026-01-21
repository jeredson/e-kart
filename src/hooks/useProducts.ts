import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface DbProduct {
  id: string;
  brand: string | null;
  model: string | null;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discounted_price: number | null;
  image: string | null;
  category_id: string | null;
  badge: string | null;
  rating: number | null;
  reviews_count: number | null;
  in_stock: boolean | null;
  featured: boolean | null;
  specifications: Json | null;
  variant_pricing: Json | null;
  variant_exceptions: Json | null;
  variant_stock: Json | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<DbProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<DbProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ featured })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success('Product featured status updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<DbCategory[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      brand: string;
      model: string;
      name: string;
      description?: string;
      price: number;
      original_price?: number;
      discounted_price?: number;
      image?: string;
      category_id?: string;
      badge?: string;
      in_stock?: boolean;
      specifications?: Record<string, any>;
      variant_pricing?: Record<string, any>;
      variant_exceptions?: string[];
      variant_stock?: Record<string, number>;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: {
      id: string;
      brand?: string;
      model?: string;
      name?: string;
      description?: string;
      price?: number;
      original_price?: number;
      discounted_price?: number;
      image?: string;
      category_id?: string;
      badge?: string;
      in_stock?: boolean;
      specifications?: Record<string, any>;
      variant_pricing?: Record<string, any>;
      variant_exceptions?: string[];
      variant_stock?: Record<string, number>;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categories: { id: string; display_order: number }[]) => {
      const updates = categories.map(cat => 
        supabase
          .from('categories')
          .update({ display_order: cat.display_order })
          .eq('id', cat.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category order updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
