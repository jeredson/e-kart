import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface VariantStockInputProps {
  specifications: SpecificationRow[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
}

const VariantStockInput = ({ specifications, value, onChange }: VariantStockInputProps) => {
  const [stockEntries, setStockEntries] = useState<Array<{ variant: string; stock: number }>>([]);

  // Get relevant specifications for stock management (Color, RAM, Storage)
  const getRelevantSpecs = () => {
    return specifications.filter(spec => 
      ['color', 'ram', 'storage', 'memory'].includes(spec.key.toLowerCase())
    );
  };

  // Generate variant combinations
  const generateVariantCombinations = () => {
    const relevantSpecs = getRelevantSpecs();
    if (relevantSpecs.length === 0) return [];

    // Sort specs by priority: Color, Ram, Storage
    const sortedSpecs = [...relevantSpecs].sort((a, b) => {
      const order = ['color', 'ram', 'storage', 'memory'];
      const indexA = order.findIndex(k => a.key.toLowerCase().includes(k));
      const indexB = order.findIndex(k => b.key.toLowerCase().includes(k));
      return indexA - indexB;
    });

    const combinations: string[] = [];
    
    const generateCombos = (index: number, current: string[]) => {
      if (index === sortedSpecs.length) {
        combinations.push(current.join(' | '));
        return;
      }
      
      const spec = sortedSpecs[index];
      spec.values.forEach(val => {
        generateCombos(index + 1, [...current, `${spec.key}: ${val.value}`]);
      });
    };

    generateCombos(0, []);
    return combinations;
  };

  useEffect(() => {
    const combinations = generateVariantCombinations();
    
    const newEntries = combinations.map(variant => ({
      variant,
      stock: value[variant] || 0
    }));
    setStockEntries(newEntries);
  }, [specifications, value]);

  const handleStockChange = (variant: string, stock: number) => {
    const newValue = { ...value };
    if (stock > 0) {
      newValue[variant] = stock;
    } else {
      delete newValue[variant];
    }
    onChange(newValue);
  };

  const addCustomVariant = () => {
    const customVariant = `Custom Variant ${Object.keys(value).length + 1}`;
    handleStockChange(customVariant, 1);
  };

  const removeVariant = (variant: string) => {
    const newValue = { ...value };
    delete newValue[variant];
    onChange(newValue);
  };

  const relevantSpecs = getRelevantSpecs();

  if (relevantSpecs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Variant Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add Color, RAM, or Storage specifications to manage variant stock.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Variant Stock Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stockEntries.map((entry, index) => (
          <div key={entry.variant} className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs">{entry.variant}</Label>
            </div>
            <Input
              type="number"
              min="0"
              value={entry.stock}
              onChange={(e) => handleStockChange(entry.variant, parseInt(e.target.value) || 0)}
              className="w-20"
              placeholder="0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(entry.variant)}
              className="h-8 w-8"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {Object.keys(value).filter(key => !stockEntries.some(entry => entry.variant === key)).map(customVariant => (
          <div key={customVariant} className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs">{customVariant}</Label>
            </div>
            <Input
              type="number"
              min="0"
              value={value[customVariant]}
              onChange={(e) => handleStockChange(customVariant, parseInt(e.target.value) || 0)}
              className="w-20"
              placeholder="0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(customVariant)}
              className="h-8 w-8"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustomVariant}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Custom Variant
        </Button>
      </CardContent>
    </Card>
  );
};

export default VariantStockInput;