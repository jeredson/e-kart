import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbBrand {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<DbBrand[]> => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useProductsByBrand = (brandId: string | null) => {
  return useQuery({
    queryKey: ['products-by-brand', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name), brand:brands(id, name, logo)')
        .eq('brand_id', brandId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!brandId,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brand: {
      name: string;
      logo?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...brand }: {
      id: string;
      name?: string;
      logo?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('brands')
        .update(brand)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Brand updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Brand deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateBrandOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brands: { id: string; display_order: number }[]) => {
      const updates = brands.map(brand => 
        supabase
          .from('brands')
          .update({ display_order: brand.display_order })
          .eq('id', brand.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand order updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};