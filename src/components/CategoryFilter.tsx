import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface CategoryFilterProps {
  selected: string[];
  onSelect: (categories: string[]) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories } = useCategories();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      onSelect([]);
    } else {
      const newSelected = selected.includes(categoryId)
        ? selected.filter(id => id !== categoryId)
        : [...selected, categoryId];
      onSelect(newSelected);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return 'All Categories';
    if (selected.length === 1) {
      const category = categories?.find(c => c.id === selected[0]);
      return category?.name || 'Unknown Category';
    }
    return `${selected.length} Categories Selected`;
  };

  const clearCategory = (categoryId: string) => {
    onSelect(selected.filter(id => id !== categoryId));
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between min-w-[200px]"
          >
            {getDisplayText()}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
              <Checkbox
                id="all-categories"
                checked={selected.length === 0}
                onCheckedChange={() => handleCategoryToggle('all')}
              />
              <label htmlFor="all-categories" className="text-sm font-medium cursor-pointer flex-1">
                🛍️ All Categories
              </label>
            </div>
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded">
                <Checkbox
                  id={category.id}
                  checked={selected.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <label htmlFor={category.id} className="text-sm cursor-pointer flex-1">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Selected Categories Badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((categoryId) => {
            const category = categories?.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                {category?.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => clearCategory(categoryId)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
