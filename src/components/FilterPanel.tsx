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
                        onCheckedChange={() => handleBrandToggle(brand)}
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
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleBrandToggle(brand)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RAM */}
        {ramSizes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">RAM</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.ramSizes.length === 0 ? 'Select RAM' : `${filters.ramSizes.length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2">
                  {ramSizes.map((ram) => (
                    <div key={ram} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                      <Checkbox
                        id={`ram-${ram}`}
                        checked={filters.ramSizes.includes(ram)}
                        onCheckedChange={() => handleRamToggle(ram)}
                      />
                      <label htmlFor={`ram-${ram}`} className="text-sm cursor-pointer flex-1">
                        {ram}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {filters.ramSizes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.ramSizes.map((ram) => (
                  <Badge key={ram} variant="secondary" className="flex items-center gap-1 text-xs">
                    {ram}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRamToggle(ram)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Storage */}
        {storageSizes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Storage</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.storageSizes.length === 0 ? 'Select storage' : `${filters.storageSizes.length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-2">
                  {storageSizes.map((storage) => (
                    <div key={storage} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                      <Checkbox
                        id={`storage-${storage}`}
                        checked={filters.storageSizes.includes(storage)}
                        onCheckedChange={() => handleStorageToggle(storage)}
                      />
                      <label htmlFor={`storage-${storage}`} className="text-sm cursor-pointer flex-1">
                        {storage}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {filters.storageSizes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.storageSizes.map((storage) => (
                  <Badge key={storage} variant="secondary" className="flex items-center gap-1 text-xs">
                    {storage}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleStorageToggle(storage)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
