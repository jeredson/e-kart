import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

interface SpecificationValue {
  value: string;
  color?: string;
  image?: string;
}

interface SpecificationRow {
  key: string;
  values: SpecificationValue[];
}

interface VariantPricingInputProps {
  specifications: SpecificationRow[];
  value?: Record<string, Record<string, number>>;
  onChange: (value: Record<string, Record<string, number>>) => void;
  exceptions?: string[];
  onExceptionsChange?: (exceptions: string[]) => void;
}

export const VariantPricingInput = ({ specifications, value = {}, onChange, exceptions = [], onExceptionsChange }: VariantPricingInputProps) => {
  const [pricingEntries, setPricingEntries] = useState<Array<{ ram: string; storage: string; price: number; notAvailable?: boolean }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get RAM and Storage specifications
  const getRamOptions = () => {
    const ramSpec = specifications.find(spec => 
      ['ram', 'memory'].includes(spec.key.toLowerCase())
    );
    return ramSpec?.values.map(v => v.value) || [];
  };

  const getStorageOptions = () => {
    const storageSpec = specifications.find(spec => 
      ['storage', 'rom'].includes(spec.key.toLowerCase())
    );
    return storageSpec?.values.map(v => v.value) || [];
  };

  useEffect(() => {
    // Only initialize once when component mounts or when value changes from empty to populated
    if (!isInitialized || (Object.keys(value).length > 0 && pricingEntries.length === 0)) {
      const entries: Array<{ ram: string; storage: string; price: number; notAvailable?: boolean }> = [];
      Object.values(value).forEach(group => {
        Object.entries(group).forEach(([combo, price]) => {
          const [ram, storage] = combo.split('_');
          if (ram && storage) {
            const isException = exceptions.includes(combo);
            entries.push({ ram, storage, price: typeof price === 'number' ? price : 0, notAvailable: isException });
          }
        });
      });
      setPricingEntries(entries);
      setIsInitialized(true);
    }
  }, [value, isInitialized, pricingEntries.length, exceptions]);

  const handleAddEntry = () => {
    const ramOptions = getRamOptions();
    const storageOptions = getStorageOptions();
    
    if (ramOptions.length > 0 && storageOptions.length > 0) {
      setPricingEntries([...pricingEntries, { ram: '', storage: '', price: 0, notAvailable: false }]);
    }
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = pricingEntries.filter((_, i) => i !== index);
    setPricingEntries(newEntries);
    updateParent(newEntries);
  };

  const handleEntryChange = (index: number, field: 'ram' | 'storage' | 'price' | 'notAvailable', val: string | number | boolean) => {
    const newEntries = [...pricingEntries];
    newEntries[index] = { ...newEntries[index], [field]: val };
    setPricingEntries(newEntries);
    
    // Always update parent to keep data in sync
    updateParent(newEntries);
  };

  const handleDropdownChange = (index: number, field: 'ram' | 'storage', val: string) => {
    const newEntries = [...pricingEntries];
    newEntries[index] = { ...newEntries[index], [field]: val };
    setPricingEntries(newEntries);
    
    // Update parent immediately to keep data in sync
    updateParent(newEntries);
  };

  const updateParent = (entries: Array<{ ram: string; storage: string; price: number; notAvailable?: boolean }>) => {
    const pricing: Record<string, Record<string, number>> = { variants: {} };
    const newExceptions: string[] = [];
    
    entries.forEach(entry => {
      if (entry.ram && entry.storage) {
        const key = `${entry.ram}_${entry.storage}`;
        if (entry.notAvailable) {
          newExceptions.push(key);
        } else if (entry.price > 0) {
          pricing.variants[key] = entry.price;
        }
      }
    });
    
    onChange(Object.keys(pricing.variants).length > 0 ? pricing : {});
    if (onExceptionsChange) {
      onExceptionsChange(newExceptions);
    }
  };

  const ramOptions = getRamOptions();
  const storageOptions = getStorageOptions();

  if (ramOptions.length === 0 || storageOptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Variant Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add RAM and Storage specifications to set variant pricing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Variant Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricingEntries.map((entry, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 border rounded">
            <Select
              value={entry.ram}
              onValueChange={(value) => handleDropdownChange(index, 'ram', value)}
            >
              <SelectTrigger className="w-full sm:w-24">
                <SelectValue placeholder="RAM" />
              </SelectTrigger>
              <SelectContent>
                {ramOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={entry.storage}
              onValueChange={(value) => handleDropdownChange(index, 'storage', value)}
            >
              <SelectTrigger className="w-full sm:w-28">
                <SelectValue placeholder="Storage" />
              </SelectTrigger>
              <SelectContent>
                {storageOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              min="0"
              step="0.01"
              value={entry.price}
              onChange={(e) => handleEntryChange(index, 'price', parseFloat(e.target.value) || 0)}
              className="w-full sm:w-24"
              placeholder="Price"
              disabled={entry.notAvailable}
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`not-available-${index}`}
                checked={entry.notAvailable || false}
                onCheckedChange={(checked) => handleEntryChange(index, 'notAvailable', checked)}
              />
              <Label htmlFor={`not-available-${index}`} className="text-xs">
                Not Available
              </Label>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveEntry(index)}
              className="h-8 w-8 flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddEntry}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Variant Price
        </Button>
      </CardContent>
    </Card>
  );
};
