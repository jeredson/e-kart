# Favorites & User Profile Implementation

## Database Setup

Run the SQL in `COMPLETE_DATABASE_UPDATE.sql` in Supabase SQL Editor.

This creates:
- `user_profiles` table (first_name, last_name, phone_number, avatar_url)
- `favorites` table (user_id, product_id)
- `avatars` storage bucket for profile pictures

## Files Created

1. **src/contexts/FavoritesContext.tsx** - Manages favorite products
2. **src/pages/Auth_new.tsx** - Updated auth with profile fields
3. **supabase/migrations/20260110000000_add_favorites_and_profiles.sql** - Migration file

## Implementation Steps

### 1. Update App.tsx to include FavoritesProvider

```tsx
import { FavoritesProvider } from '@/contexts/FavoritesContext';

// Wrap app with FavoritesProvider
<AuthProvider>
  <FavoritesProvider>
    <CartProvider>
      {/* rest of app */}
    </CartProvider>
  </FavoritesProvider>
</AuthProvider>
```

### 2. Update ProductCard.tsx - Add Heart Icon

```tsx
import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';

// In component:
const { user } = useAuth();
const { isFavorite, addFavorite, removeFavorite } = useFavorites();

const handleFavoriteClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  if (!user) {
    toast.error('Please sign in to add favorites');
    return;
  }
  if (isFavorite(product.id)) {
    removeFavorite(product.id);
  } else {
    addFavorite(product.id);
  }
};

// Add to card (top right corner):
<Button
  variant="ghost"
  size="icon"
  className="absolute top-2 right-2 z-10"
  onClick={handleFavoriteClick}
>
  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
</Button>
```

### 3. Update ProductDetailModal.tsx - Add Heart Icon

```tsx
// Same imports and logic as ProductCard
// Add button near the X button:
<Button
  variant="ghost"
  size="icon"
  className="absolute right-12 top-2 z-10 bg-background/80 backdrop-blur-sm h-8 w-8"
  onClick={handleFavoriteClick}
>
  <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
</Button>
```

### 4. Update Navbar.tsx - Add Favorites Button & User Profile

```tsx
import { Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Load user profile:
const [userProfile, setUserProfile] = useState<any>(null);

useEffect(() => {
  if (user) {
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setUserProfile(data));
  }
}, [user]);

// Add favorites button before cart:
<Button variant="ghost" size="icon" asChild>
  <Link to="/favorites">
    <Heart className="w-5 h-5" />
    {favorites.length > 0 && (
      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
        {favorites.length}
      </Badge>
    )}
  </Link>
</Button>

// Update user button to show avatar and name:
{user ? (
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="flex items-center gap-2">
      {userProfile?.avatar_url ? (
        <img src={userProfile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
      ) : (
        <User className="w-5 h-5" />
      )}
      <span className="hidden md:inline">{userProfile?.first_name}</span>
    </Button>
  </DropdownMenuTrigger>
  // ... rest
) : (
  // ... sign in button
)}
```

### 5. Update CartContext.tsx - Require Auth

```tsx
const { user } = useAuth();

const addToCart = (product: Product) => {
  if (!user) {
    toast.error('Please sign in to add items to cart');
    return;
  }
  // ... existing logic
};
```

### 6. Create Favorites Page

```tsx
// src/pages/Favorites.tsx
import { useFavorites } from '@/contexts/FavoritesContext';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

const Favorites = () => {
  const { favorites } = useFavorites();
  const { data: products } = useProducts();
  
  const favoriteProducts = products?.filter(p => favorites.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      {favoriteProducts?.length === 0 ? (
        <p>No favorites yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts?.map(product => (
            <ProductCard key={product.id} product={product} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
```

### 7. Add Route in App.tsx

```tsx
import Favorites from '@/pages/Favorites';

<Route path="/favorites" element={<Favorites />} />
```

## Key Features

✅ User signup with first name, last name, phone, avatar
✅ Avatar upload to Supabase storage
✅ Favorites system with heart icon
✅ Auth required for cart and favorites
✅ User profile display in navbar
✅ Favorites page to view all favorites

## Testing

1. Run SQL in Supabase
2. Sign up with new account (add profile info)
3. Try adding to cart without login (should show error)
4. Try adding to favorites without login (should show error)
5. Sign in and add favorites
6. Check navbar shows avatar and name
7. Visit /favorites page
