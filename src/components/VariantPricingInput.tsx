import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface VariantPrice {
  combination: string;
  originalPrice: number;
  discountedPrice: number;
}

interface VariantPricingInputProps {
  value?: Record<string, Record<string, number>>;
  onChange: (value: Record<string, Record<string, number>>) => void;
  exceptions?: string[];
  onExceptionsChange?: (exceptions: string[]) => void;
}

export const VariantPricingInput = ({ value = {}, onChange, exceptions = [], onExceptionsChange }: VariantPricingInputProps) => {
  const [variants, setVariants] = useState<VariantPrice[]>(() => {
    const existing: VariantPrice[] = [];
    Object.values(value).forEach(group => {
      Object.entries(group).forEach(([combo, priceData]) => {
        if (typeof priceData === 'object' && 'discountedPrice' in priceData) {
          existing.push({ combination: combo, originalPrice: (priceData as any).originalPrice || 0, discountedPrice: (priceData as any).discountedPrice || 0 });
        } else {
          existing.push({ combination: combo, originalPrice: 0, discountedPrice: priceData as number });
        }
      });
    });
    return existing.length > 0 ? existing : [{ combination: '', originalPrice: 0, discountedPrice: 0 }];
  });

  const handleAdd = () => {
    setVariants([...variants, { combination: '', originalPrice: 0, discountedPrice: 0 }]);
  };

  const handleRemove = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    updateParent(newVariants);
  };

  const handleChange = (index: number, field: 'combination' | 'originalPrice' | 'discountedPrice', val: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: val };
    setVariants(newVariants);
    updateParent(newVariants);
  };

  const toggleException = (combination: string) => {
    if (!onExceptionsChange) return;
    const newExceptions = exceptions.includes(combination)
      ? exceptions.filter(e => e !== combination)
      : [...exceptions, combination];
    onExceptionsChange(newExceptions);
  };

  const updateParent = (variantList: VariantPrice[]) => {
    const pricing: Record<string, Record<string, any>> = { variants: {} };
    variantList.forEach(v => {
      if (v.combination && v.discountedPrice > 0) {
        pricing.variants[v.combination] = {
          originalPrice: v.originalPrice || undefined,
          discountedPrice: v.discountedPrice
        };
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
        Format: RAM_Storage (e.g., 8GB_128GB). Check to mark as unavailable.
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {variants.map((variant, index) => (
          <div key={index} className="flex gap-2 items-center">
            {onExceptionsChange && (
              <Checkbox
                checked={exceptions.includes(variant.combination)}
                onCheckedChange={() => toggleException(variant.combination)}
                disabled={!variant.combination}
              />
            )}
            <Input
              placeholder="e.g., 8GB_128GB"
              value={variant.combination}
              onChange={(e) => handleChange(index, 'combination', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Original"
              value={variant.originalPrice || ''}
              onChange={(e) => handleChange(index, 'originalPrice', parseFloat(e.target.value) || 0)}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Discounted"
              value={variant.discountedPrice || ''}
              onChange={(e) => handleChange(index, 'discountedPrice', parseFloat(e.target.value) || 0)}
              className="w-24"
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
