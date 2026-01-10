# Quick Fix - Add Brand & Model Columns

## Your Project is Working!
Your Supabase project exists and has data. You just need to add 2 columns.

## How to Access Your Project

### Option 1: Check All Your Supabase Accounts
You might have multiple Supabase accounts. Try logging in with:
- Your GitHub account
- Your Google account  
- Your work email
- Your personal email

Go to https://supabase.com/dashboard and try each login method.

### Option 2: Use Direct Database Connection
Since your project is working, run this SQL directly:

1. Try this link (might work): https://supabase.com/dashboard/project/ggqmzavgcmphbqvhzwhu/sql/new

2. If that doesn't work, contact Supabase support with your project ID: **ggqmzavgcmphbqvhzwhu**

## The SQL You Need to Run

Once you access the SQL Editor, run this:

```sql
-- Add brand and model columns
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
```

## Alternative: Use Supabase API (Advanced)

If you can't access the dashboard, you can use the API:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref ggqmzavgcmphbqvhzwhu

# Run migration
supabase db push
```

## Your Current Data
Your project has 8 products already:
- iPhone 15 Pro Max
- Samsung Galaxy S24 Ultra
- MacBook Pro 16" M3 Max
- Dell XPS 15
- ASUS TUF A15
- Sony WH-1000XM5
- Apple AirPods Pro 2
- Oppo k13

All working fine! Just need to add brand/model columns.
