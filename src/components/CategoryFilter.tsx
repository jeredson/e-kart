import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories } = useCategories();
  const isMobile = useIsMobile();

  // Mobile: Dropdown
  if (isMobile) {
    return (
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">🛍️ All Products</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Desktop: Buttons
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
