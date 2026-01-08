# Quick Start Guide - Testing New Features

## Prerequisites
1. Apply the database migration (see DATABASE_MIGRATION.md)
2. Restart your development server: `npm run dev`

## Feature Testing Guide

### 1. Test Brand & Model Split (Admin Panel)

**Steps:**
1. Navigate to `/admin`
2. Click "Add Product"
3. Fill in the form:
   - **Brand**: Samsung
   - **Model**: Galaxy S24 Ultra
   - **Price**: 124999
   - **Category**: Smartphones
   - **Description**: Flagship smartphone with AI features
   - **Specifications**: Add RAM (12GB), Storage (256GB)
4. Click "Create Product"
5. Verify the product appears with brand and model separated

**Expected Result:**
- Product name auto-generated as "Samsung Galaxy S24 Ultra"
- Brand shown as subtitle in product cards
- Model shown as main title

### 2. Test Advanced Filters (Desktop)

**Steps:**
1. Go to home page
2. Look for the filter sidebar on the left
3. Test each filter:
   - **Price Range**: Drag slider to filter by price
   - **Brand**: Check/uncheck brand checkboxes
   - **RAM**: Select RAM sizes
   - **Storage**: Select storage capacities
4. Click "Clear" to reset all filters

**Expected Result:**
- Products update in real-time as filters change
- Product count updates
- Multiple filters work together (AND logic)

### 3. Test Mobile Category Dropdown

**Steps:**
1. Resize browser to mobile width (< 768px) or use device emulator
2. Look at the category section
3. Click the dropdown
4. Select different categories

**Expected Result:**
- Desktop: Shows category buttons
- Mobile: Shows dropdown select menu
- Smooth transition between layouts

### 4. Test Store Name Visibility (Mobile)

**Steps:**
1. Open site on mobile device or emulator
2. Scroll down the page
3. Observe the navbar

**Expected Result:**
- "TechStore" text visible next to logo
- Remains visible while scrolling
- No layout shift

### 5. Test Compact Mobile Product Cards

**Steps:**
1. Open site on mobile device (< 768px width)
2. Scroll through product list
3. Observe card layout

**Expected Result:**
- Horizontal layout (image left, content right)
- Brand shown above model name
- Green rating badge
- Key specs displayed (RAM, Storage, Display)
- Compact "Add" button with cart icon
- More products visible in viewport

### 6. Test Mobile Filter Panel

**Steps:**
1. Open site on mobile device
2. Click "Filters" button in header
3. Slide-in panel opens from left
4. Test all filter options
5. Close panel

**Expected Result:**
- Smooth slide-in animation
- All filters accessible
- Scrollable content
- Easy to dismiss
- Filters persist when reopening

## Sample Product Data for Testing

Add these products via Admin panel to test all features:

### Product 1: Smartphone
- Brand: Samsung
- Model: Galaxy S24 Ultra
- Price: 124999
- Category: Smartphones
- Specifications:
  - RAM: 12GB
  - Storage: 256GB
  - Display: 6.8"

### Product 2: Laptop
- Brand: Apple
- Model: MacBook Pro M3
- Price: 199900
- Category: Laptops
- Specifications:
  - RAM: 16GB
  - Storage: 512GB
  - Display: 14"

### Product 3: Budget Phone
- Brand: Xiaomi
- Model: Redmi Note 13
- Price: 15999
- Category: Smartphones
- Specifications:
  - RAM: 6GB
  - Storage: 128GB
  - Display: 6.67"

### Product 4: Tablet
- Brand: Samsung
- Model: Galaxy Tab S9
- Price: 74999
- Category: Tablets
- Specifications:
  - RAM: 8GB
  - Storage: 256GB
  - Display: 11"

## Testing Filters

After adding the sample products above, test these filter combinations:

1. **Price Range**: ₹10,000 - ₹50,000
   - Should show: Redmi Note 13
   
2. **Brand**: Samsung
   - Should show: Galaxy S24 Ultra, Galaxy Tab S9
   
3. **RAM**: 12GB
   - Should show: Galaxy S24 Ultra
   
4. **Storage**: 256GB
   - Should show: Galaxy S24 Ultra, Galaxy Tab S9
   
5. **Combined**: Brand=Samsung + RAM=12GB + Storage=256GB
   - Should show: Galaxy S24 Ultra only

## Mobile Testing Devices

Test on these screen sizes:
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad Mini (768px)
- iPad Pro (1024px)

## Common Issues & Solutions

### Issue: Filters not working
**Solution**: Check browser console for errors, ensure products have specifications

### Issue: Mobile cards not showing
**Solution**: Verify screen width < 768px, check useIsMobile hook

### Issue: Brand/Model fields missing in Admin
**Solution**: Ensure database migration was applied successfully

### Issue: Store name still hidden on mobile
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Category dropdown not appearing on mobile
**Solution**: Check screen width, verify useIsMobile hook is working

## Performance Benchmarks

Expected performance metrics:
- Initial page load: < 2s
- Filter application: < 100ms
- Mobile card render: < 50ms per card
- Category switch: < 200ms

## Feedback & Improvements

After testing, consider these enhancements:
1. Add loading skeletons for better UX
2. Implement filter result count before applying
3. Add "Sort by" options (price, rating, newest)
4. Implement product comparison feature
5. Add "Recently Viewed" section
6. Implement wishlist functionality
