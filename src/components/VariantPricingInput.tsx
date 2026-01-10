import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface VariantPrice {
  combination: string;
  price: number;
}

interface VariantPricingInputProps {
  value?: Record<string, Record<string, number>>;
  onChange: (value: Record<string, Record<string, number>>) => void;
}

export const VariantPricingInput = ({ value = {}, onChange }: VariantPricingInputProps) => {
  const [variants, setVariants] = useState<VariantPrice[]>(() => {
    const existing: VariantPrice[] = [];
    Object.values(value).forEach(group => {
      Object.entries(group).forEach(([combo, price]) => {
        existing.push({ combination: combo, price });
      });
    });
    return existing.length > 0 ? existing : [{ combination: '', price: 0 }];
  });

  const handleAdd = () => {
    setVariants([...variants, { combination: '', price: 0 }]);
  };

  const handleRemove = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    updateParent(newVariants);
  };

  const handleChange = (index: number, field: 'combination' | 'price', val: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: val };
    setVariants(newVariants);
    updateParent(newVariants);
  };

  const updateParent = (variantList: VariantPrice[]) => {
    const pricing: Record<string, Record<string, number>> = { variants: {} };
    variantList.forEach(v => {
      if (v.combination && v.price > 0) {
        pricing.variants[v.combination] = v.price;
      }
    });
    onChange(Object.keys(pricing.variants).length > 0 ? pricing : {});
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Variant Pricing (Optional)</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Format: RAM_Storage (e.g., 8GB_128GB, 12GB_256GB)
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {variants.map((variant, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="e.g., 8GB_128GB"
              value={variant.combination}
              onChange={(e) => handleChange(index, 'combination', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Price"
              value={variant.price || ''}
              onChange={(e) => handleChange(index, 'price', parseFloat(e.target.value) || 0)}
              className="w-28"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => handleRemove(index)}
              disabled={variants.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
