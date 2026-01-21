# Category Display Order Feature

## Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Add display_order column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial order based on current order
UPDATE categories SET display_order = (
  SELECT ROW_NUMBER() OVER (ORDER BY name) - 1
  FROM categories c2
  WHERE c2.id = categories.id
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
```

## Features

- **Reorder Categories**: Use up/down arrows in the admin panel to change category order
- **Main Page Display**: Categories appear in the order set by admin
- **Persistent Order**: Order is saved in the database

## Usage

1. Go to Admin Panel
2. Find the Categories section
3. Use ⬆️ and ⬇️ buttons to reorder categories
4. Changes are saved automatically
5. Categories will appear in this order on the main page

## How It Works

- Each category has a `display_order` field (0, 1, 2, ...)
- Categories are sorted by `display_order` instead of name
- Admin can move categories up or down
- Order updates are saved to database immediately
