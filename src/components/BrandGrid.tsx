import { useBrands } from '@/hooks/useBrands';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface BrandGridProps {
  onBrandSelect?: (brandName: string) => void;
}

const BrandGrid = ({ onBrandSelect }: BrandGridProps) => {
  const { data: brands, isLoading } = useBrands();
  const navigate = useNavigate();

  const handleBrandClick = (brandName: string) => {
    if (onBrandSelect) {
      onBrandSelect(brandName);
    } else {
      navigate(`/?brand=${encodeURIComponent(brandName)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Shop by Brand</h2>
          <p className="text-muted-foreground">Choose your favorite brand</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="aspect-square">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Shop by Brand</h2>
          <p className="text-muted-foreground">No brands available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Shop by Brand</h2>
        <p className="text-muted-foreground">Choose your favorite brand</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <Card 
            key={brand.id} 
            className="aspect-square cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleBrandClick(brand.name)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 mb-3 flex items-center justify-center">
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-center text-sm">{brand.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrandGrid;