# Quick Start - Database Migration

## Run This SQL in Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL below:

```sql
-- Add shop_name and shop_address columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS shop_name TEXT,
ADD COLUMN IF NOT EXISTS shop_address TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('shop_name', 'shop_address');
```

5. Click "Run" (or press Ctrl+Enter / Cmd+Enter)
6. You should see a success message and the verification query should return 2 rows

## That's it!

Your database is now updated and ready to use the new features:
- Shop Name field in signup and settings
- Shop Address field in signup and settings
- Variants display in favorites
- Enhanced checkout with variant selection
- Add multiple variants of same product

## Test the Features

1. **Test Favorites:**
   - Add products with variants to favorites
   - Open favorites drawer
   - Verify variants show between name and price

2. **Test Checkout:**
   - Add products to cart
   - Go to checkout
   - Change variants using dropdowns
   - Click + icon to add another variant
   - Verify stock limits work

3. **Test Shop Info:**
   - Sign up new account with shop name/address
   - Go to Settings
   - Edit shop information
   - Verify changes save

Enjoy your enhanced e-commerce platform! 🚀
