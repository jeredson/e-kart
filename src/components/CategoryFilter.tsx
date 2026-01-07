import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories } = useCategories();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === 'all' ? 'default' : 'secondary'}
        size="sm"
        onClick={() => onSelect('all')}
        className={cn(
          'rounded-full transition-all',
          selected === 'all' && 'shadow-glow'
        )}
      >
        <span className="mr-2">🛍️</span>
        All Products
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selected === category.id ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSelect(category.id)}
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
