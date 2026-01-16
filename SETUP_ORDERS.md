# Setup Instructions for User Management and Orders

## Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add is_approved column to profiles table (new users need approval, admins auto-approved)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Update existing users to be approved
UPDATE profiles SET is_approved = true;

-- Update admins to always be approved
UPDATE profiles SET is_approved = true WHERE is_admin = true;
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
- Existing users are automatically approved (is_approved = true)
- New users can be approved/unapproved by admin
- Orders use shop details from user profile settings
- Users must set shop name and address in Settings before placing orders
