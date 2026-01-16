# Setup Instructions for User Management and Orders

## Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add is_approved column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  variants JSONB DEFAULT '{}',
  shop_name TEXT NOT NULL,
  shop_address TEXT NOT NULL,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_name ON orders(shop_name);
CREATE INDEX IF NOT EXISTS idx_orders_is_delivered ON orders(is_delivered);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

## Features Added

### Admin Features
1. **User Management** (`/admin/users`)
   - View all registered users
   - Approve/revoke user access
   - Delete users
   - Users must be approved by admin before they can sign in

2. **Order Management** (`/admin/orders`)
   - View all orders from all users
   - Filter orders by shop name
   - View detailed order information (product, variants, shop details)
   - Mark orders as delivered
   - Track order status

### User Features
1. **Order History** (`/orders`)
   - View all personal orders
   - See order status (Processing/Delivered)
   - View product details and variants
   - See shop information

### Checkout Flow
- Users enter shop name and address when placing orders
- Orders are created with product variants and quantities
- Cart is cleared after successful order placement

## Navigation

### Admin Icons (Top Right)
- **Users Icon**: User management
- **Package Icon**: Order management

### User Icons (Top Right)
- **Package Icon**: My orders

## Notes
- New users are not approved by default (is_approved = false)
- Admin must approve users before they can sign in
- Orders track delivery status
- Shop information is stored with each order
