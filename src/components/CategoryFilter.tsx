import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories } = useCategories();

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      onSelect(null);
    } else {
      onSelect(selected === categoryId ? null : categoryId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'secondary'}
        size="sm"
        onClick={() => handleCategorySelect('all')}
        className={cn(
          'rounded-full transition-all',
          selected === null && 'shadow-glow'
        )}
      >
        <span className="mr-2">🛍️</span>
        All Categories
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selected === category.id ? 'default' : 'secondary'}
          size="sm"
          onClick={() => handleCategorySelect(category.id)}
          className={cn(
            'rounded-full transition-all',
            selected === category.id && 'shadow-glow'
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
