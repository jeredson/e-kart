# Quick Setup Guide - Brands Feature

## Step 1: Create Brands Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **e-kart**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `create_brands_table.sql`
6. Click **Run** or press `Ctrl+Enter`

You should see success messages like:
- "Brands created: X"
- "Products with brand_id: X"

## Step 2: Verify the Table

1. Go to **Table Editor** in Supabase
2. You should now see a new table called **brands**
3. Check if any brands were auto-created from your existing products

## Step 3: Test the Feature

1. Go to your website: https://your-site.vercel.app
2. Login as admin (agnesmobiles.b2b@gmail.com)
3. Go to `/admin`
4. Click on the **Brands** tab
5. Click **Go to Brand Management**

## Step 4: Add Your First Brand

1. Click **Add Brand** button
2. Fill in:
   - **Brand Name**: e.g., "Samsung"
   - **Description**: Optional description
   - **Brand Logo**: 
     - Switch to **URL** tab
     - Paste image URL (e.g., from Google Images)
     - Image should preview immediately
3. Click **Create Brand**

## Image URL Tips

For best results with brand logos:
- Use direct image URLs (ending in .jpg, .png, .webp)
- Recommended size: 200x200px or larger
- Use square images for best display
- Example sources:
  - Upload to Cloudinary via Upload tab
  - Use direct links from image hosting services
  - Google Drive public links (convert to direct link)

## Troubleshooting

### "Table not found" error
- Run the SQL script in Supabase SQL Editor

### Image not showing preview
- Make sure URL is a direct image link
- Try switching between URL and Upload tabs
- Check browser console for CORS errors

### Can't add brands (403 error)
- Make sure you're logged in as admin
- Run the admin privileges SQL script: `fix_admin_privileges.sql`

## What Happens After Setup

1. **Homepage**: Shows brand cards instead of products
2. **Click Brand**: Shows only products from that brand
3. **Search**: Still works across all products
4. **Admin Panel**: Full brand management with drag & drop ordering

## Next Steps

1. Add all your brands with logos
2. Link products to brands (optional - already done if products had brand field)
3. Reorder brands by dragging or using up/down arrows
4. Test brand navigation on homepage
