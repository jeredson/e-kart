# Fix: Separate Order and Cancel Webhooks

## The Problem
You're using the same webhook URL for both order placement and cancellation, which breaks your working order emails.

## The Solution
Create TWO separate Zaps with different webhook URLs.

---

## Step 1: Create Cancel Email Zap

1. Go to Zapier
2. Click **Create Zap**
3. Name it: "Order Cancellation Emails"
4. Webhooks by Zapier → Catch Hook
5. **COPY THE NEW WEBHOOK URL**
6. This will be different from your order webhook

---

## Step 2: Update Cancel Webhook URLs

Replace `CANCEL_WEBHOOK_URL` in these files with your new webhook URL:

### UserOrders.tsx (line ~145):
```typescript
const response = await fetch('YOUR_NEW_CANCEL_WEBHOOK_URL', {
```

### AdminOrders.tsx (line ~235):
```typescript
await fetch('YOUR_NEW_CANCEL_WEBHOOK_URL', {
```

---

## Step 3: Set Up Cancel Zap Actions

Follow the same steps as your working order Zap:
1. GET user email from Supabase
2. GET product details from Supabase
3. Send email to customer
4. Send email to admin

Use the JavaScript code you already have that works!

---

## Step 4: Add Filter (Optional)

In your ORDER Zap, add a Filter step after the webhook:
- **Only continue if:** `event_type` equals `order_placed`

In your CANCEL Zap, add a Filter step:
- **Only continue if:** `event_type` equals `order_cancelled`

This ensures each Zap only processes its own events.

---

## Summary

**Before (Broken):**
- One webhook URL for everything ❌
- Order emails stopped working

**After (Fixed):**
- Order Zap: `https://hooks.zapier.com/hooks/catch/26132431/ulyrew2/` ✅
- Cancel Zap: `https://hooks.zapier.com/hooks/catch/26132431/NEW_URL/` ✅
- Both work independently

---

## Quick Fix Steps

1. Create new Zap for cancellations
2. Get new webhook URL
3. Replace `CANCEL_WEBHOOK_URL` in code with new URL
4. Hard refresh browser (Ctrl+Shift+R)
5. Test both order placement and cancellation
6. Both should send emails now! 🎉
