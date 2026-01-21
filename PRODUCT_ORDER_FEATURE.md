# Product Display Order Feature - Drag & Drop

## Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Add display_order column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on current order
UPDATE products SET display_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1
  FROM products p2
  WHERE p2.id = products.id
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
```

## Features

- **Drag & Drop**: Drag products to reorder them in the admin panel
- **Visual Feedback**: Grip icon (⋮⋮) indicates draggable items
- **Main Page Display**: Products appear in the order set by admin
- **Persistent Order**: Order is saved in the database

## Usage

1. Go to Admin Panel
2. Find the Products table
3. Click and drag any product row by the grip icon
4. Drop it in the desired position
5. Changes are saved automatically
6. Products will appear in this order on the main page

## How It Works

- Each product has a `display_order` field (0, 1, 2, ...)
- Products are sorted by `display_order` instead of created_at
- Admin can drag and drop to reorder
- Order updates are saved to database immediately
- All products are reordered when one is moved

## Combined with Categories

- Categories also have display order (see CATEGORY_ORDER_FEATURE.md)
- Both features work together for complete control over product display
