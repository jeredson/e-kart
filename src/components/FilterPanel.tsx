import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronDown } from 'lucide-react';

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  ramSizes: string[];
  storageSizes: string[];
  [key: string]: [number, number] | string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const FilterPanel = ({ filters, onFilterChange, onReset }: FilterPanelProps) => {
  const { data: products } = useProducts();

  // Extract unique values from products
  const brands = Array.from(new Set(products?.map(p => p.brand).filter(Boolean))) as string[];
  
  // Get all unique specification keys except color and internal fields
  const allSpecs = new Map<string, Set<string>>();
  
  // Normalize specification keys
  const normalizeKey = (key: string): string => {
    const lower = key.toLowerCase();
    if (lower === 'ram' || lower === 'memory') return 'RAM';
    if (lower === 'storage' || lower === 'rom') return 'Storage';
    return key;
  };
  
  console.log('=== FILTER PANEL DEBUG ===');
  console.log('Total products:', products?.length);
  
  products?.forEach((p, idx) => {
    const specs = p.specifications as Record<string, any> | null;
    if (!specs) {
      console.log(`Product ${idx} (${p.name}): No specs`);
      return;
    }
    
    console.log(`Product ${idx} (${p.name}):`, specs);
    
    // Handle _ordered array format
    if (specs._ordered && Array.isArray(specs._ordered)) {
      console.log(`  Processing _ordered array:`, specs._ordered);
      specs._ordered.forEach((item: any) => {
        if (item && typeof item === 'object') {
          Object.entries(item).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase();
            if (lowerKey === 'color' || lowerKey === 'colour') return;
            
            const normalizedKey = normalizeKey(key);
            console.log(`    Key: ${key} -> Normalized: ${normalizedKey}, Value:`, value);
            
            if (!allSpecs.has(normalizedKey)) {
              allSpecs.set(normalizedKey, new Set());
            }
            
            // Extract values
            if (value === null || value === undefined) return;
            
            if (typeof value === 'string' && value.trim()) {
              allSpecs.get(normalizedKey)!.add(value.trim());
            } else if (Array.isArray(value)) {
              value.forEach((v: any) => {
                if (v === null || v === undefined) return;
                if (typeof v === 'string' && v.trim()) {
                  allSpecs.get(normalizedKey)!.add(v.trim());
                } else if (typeof v === 'number') {
                  allSpecs.get(normalizedKey)!.add(String(v));
                } else if (typeof v === 'object' && v.value) {
                  const val = String(v.value).trim();
                  if (val) allSpecs.get(normalizedKey)!.add(val);
                }
              });
            } else if (typeof value === 'number') {
              allSpecs.get(normalizedKey)!.add(String(value));
            }
          });
        }
      });
    }
    
    Object.entries(specs).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      // Skip color and _ordered (already processed)
      if (lowerKey === 'color' || lowerKey === 'colour' || key === '_ordered') return;
      
      const normalizedKey = normalizeKey(key);
      console.log(`  Key: ${key} -> Normalized: ${normalizedKey}, Value:`, value);
      
      if (!allSpecs.has(normalizedKey)) {
        allSpecs.set(normalizedKey, new Set());
      }
      
      // Handle different value structures
      if (value === null || value === undefined) return;
      
      if (typeof value === 'string' && value.trim()) {
        allSpecs.get(normalizedKey)!.add(value.trim());
      } else if (Array.isArray(value)) {
        value.forEach((v: any) => {
          if (v === null || v === undefined) return;
          
          if (typeof v === 'string' && v.trim()) {
            allSpecs.get(normalizedKey)!.add(v.trim());
          } else if (typeof v === 'number') {
            allSpecs.get(normalizedKey)!.add(String(v));
          } else if (typeof v === 'object') {
            // Handle {value: "8GB"} or {label: "8GB", value: "8GB"}
            if (v.value !== undefined && v.value !== null) {
              const val = String(v.value).trim();
              if (val) allSpecs.get(normalizedKey)!.add(val);
            } else if (v.label !== undefined && v.label !== null) {
              const val = String(v.label).trim();
              if (val) allSpecs.get(normalizedKey)!.add(val);
            } else {
              // Try to stringify the object
              const val = JSON.stringify(v).trim();
              if (val && val !== '{}') allSpecs.get(normalizedKey)!.add(val);
            }
          }
        });
      } else if (typeof value === 'number') {
        allSpecs.get(normalizedKey)!.add(String(value));
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle single object {value: "8GB"}
        if (value.value !== undefined && value.value !== null) {
          const val = String(value.value).trim();
          if (val) allSpecs.get(normalizedKey)!.add(val);
        } else if (value.label !== undefined && value.label !== null) {
          const val = String(value.label).trim();
          if (val) allSpecs.get(normalizedKey)!.add(val);
        }
      }
    });
  });
  
  console.log('Final allSpecs:', Object.fromEntries(Array.from(allSpecs.entries()).map(([k, v]) => [k, Array.from(v)])));
  console.log('=== END DEBUG ===');
  
  const specFilters = Array.from(allSpecs.entries())
    .filter(([key, values]) => values.size > 0)
    .map(([key, values]) => ({
      key,
      values: Array.from(values).sort((a, b) => {
        // Try to sort numerically if possible
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      })
    }));

  const maxPrice = Math.max(...(products?.map(p => Number(p.price)) || [100000]));

  const handleSpecToggle = (specKey: string, value: string) => {
    const currentValues = (filters[specKey] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [specKey]: newValues });
  };

  const hasActiveFilters = 
    filters.brands.length > 0 || 
    Object.keys(filters).some(key => 
      key !== 'priceRange' && key !== 'brands' && Array.isArray(filters[key]) && (filters[key] as string[]).length > 0
    ) ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Price Range</Label>
          <div className="px-2">
            <Slider
              min={0}
              max={maxPrice}
              step={1000}
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ ...filters, priceRange: value as [number, number] })}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
            <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Brands */}
        {brands.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Brand</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.brands.length === 0 ? 'Select brands' : `${filters.brands.length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={filters.brands.includes(brand)}
                        onCheckedChange={() => handleSpecToggle('brands', brand)}
                      />
                      <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer flex-1">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {filters.brands.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.brands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="flex items-center gap-1 text-xs">
                    {brand}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleSpecToggle('brands', brand)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Specification Filters */}
        {specFilters.map(({ key, values }) => (
          <div key={key} className="space-y-3">
            <Label className="text-sm font-semibold">{key}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {((filters[key] as string[]) || []).length === 0 ? `Select ${key}` : `${((filters[key] as string[]) || []).length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {values.map((value) => (
                    <div key={value} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                      <Checkbox
                        id={`${key}-${value}`}
                        checked={((filters[key] as string[]) || []).includes(value)}
                        onCheckedChange={() => handleSpecToggle(key, value)}
                      />
                      <label htmlFor={`${key}-${value}`} className="text-sm cursor-pointer flex-1">
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {((filters[key] as string[]) || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {((filters[key] as string[]) || []).map((value) => (
                  <Badge key={value} variant="secondary" className="flex items-center gap-1 text-xs">
                    {value}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleSpecToggle(key, value)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
