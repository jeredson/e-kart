import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface CategoryFilterProps {
  selected: string[];
  onSelect: (categories: string[]) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories } = useCategories();

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

  const clearCategory = (categoryId: string) => {
    onSelect(selected.filter(id => id !== categoryId));
  };

  return (
    <div className="space-y-3">
      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selected.length === 0 ? 'default' : 'secondary'}
          size="sm"
          onClick={() => handleCategoryToggle('all')}
          className={cn(
            'rounded-full transition-all',
            selected.length === 0 && 'shadow-glow'
          )}
        >
          <span className="mr-2">🛍️</span>
          All Categories
        </Button>
        {categories?.map((category) => (
          <Button
            key={category.id}
            variant={selected.includes(category.id) ? 'default' : 'secondary'}
            size="sm"
            onClick={() => handleCategoryToggle(category.id)}
            className={cn(
              'rounded-full transition-all',
              selected.includes(category.id) && 'shadow-glow'
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
      
      {/* Selected Categories Badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((categoryId) => {
            const category = categories?.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="outline" className="flex items-center gap-1">
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
