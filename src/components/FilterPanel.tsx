import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  ramSizes: string[];
  storageSizes: string[];
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
  
  const ramSizes = Array.from(
    new Set(
      products?.flatMap(p => {
        const specs = p.specifications as Record<string, any> | null;
        if (!specs) return [];
        const ram = specs['RAM'] || specs['ram'] || specs['Memory'];
        if (typeof ram === 'string') return [ram];
        if (Array.isArray(ram)) return ram.map((r: any) => r.value || r);
        return [];
      }).filter(Boolean)
    )
  ).sort() as string[];

  const storageSizes = Array.from(
    new Set(
      products?.flatMap(p => {
        const specs = p.specifications as Record<string, any> | null;
        if (!specs) return [];
        const storage = specs['Storage'] || specs['storage'] || specs['ROM'];
        if (typeof storage === 'string') return [storage];
        if (Array.isArray(storage)) return storage.map((s: any) => s.value || s);
        return [];
      }).filter(Boolean)
    )
  ).sort() as string[];

  const maxPrice = Math.max(...(products?.map(p => Number(p.price)) || [100000]));

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleRamToggle = (ram: string) => {
    const newRam = filters.ramSizes.includes(ram)
      ? filters.ramSizes.filter(r => r !== ram)
      : [...filters.ramSizes, ram];
    onFilterChange({ ...filters, ramSizes: newRam });
  };

  const handleStorageToggle = (storage: string) => {
    const newStorage = filters.storageSizes.includes(storage)
      ? filters.storageSizes.filter(s => s !== storage)
      : [...filters.storageSizes, storage];
    onFilterChange({ ...filters, storageSizes: newStorage });
  };

  const hasActiveFilters = 
    filters.brands.length > 0 || 
    filters.ramSizes.length > 0 || 
    filters.storageSizes.length > 0 ||
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAM */}
        {ramSizes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">RAM</Label>
            <div className="space-y-2">
              {ramSizes.map((ram) => (
                <div key={ram} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ram-${ram}`}
                    checked={filters.ramSizes.includes(ram)}
                    onCheckedChange={() => handleRamToggle(ram)}
                  />
                  <label
                    htmlFor={`ram-${ram}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {ram}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage */}
        {storageSizes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Storage</Label>
            <div className="space-y-2">
              {storageSizes.map((storage) => (
                <div key={storage} className="flex items-center space-x-2">
                  <Checkbox
                    id={`storage-${storage}`}
                    checked={filters.storageSizes.includes(storage)}
                    onCheckedChange={() => handleStorageToggle(storage)}
                  />
                  <label
                    htmlFor={`storage-${storage}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {storage}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
