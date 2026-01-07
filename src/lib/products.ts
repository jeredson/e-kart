export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

// Legacy static products - now products come from database
export const products: Product[] = [];

export const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
];
