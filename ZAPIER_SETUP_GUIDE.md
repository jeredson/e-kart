# Zapier Email Notification Setup Guide

## Overview
This guide will help you set up Zapier to send email notifications when orders are placed, including product details, individual prices, and subtotal.

## Prerequisites
- Zapier account (free or paid)
- Access to your Supabase database
- Your Zapier webhook URL: `https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/`

## Step-by-Step Setup

### Step 1: Create a New Zap
1. Log in to your Zapier account
2. Click "Create Zap" button
3. Name your Zap: "E-Kart Order Notifications"

### Step 2: Set Up the Trigger (Webhooks by Zapier)
1. **Choose App**: Search for "Webhooks by Zapier"
2. **Choose Event**: Select "Catch Hook"
3. Click "Continue"
4. **Webhook URL**: Copy the webhook URL provided by Zapier
   - Example: `https://hooks.zapier.com/hooks/catch/26132431/uq6xigu/`
5. Click "Continue"
6. **Test the Trigger**: 
   - Place a test order in your app
   - Zapier should catch the webhook data
   - You should see fields like:
     - `id` (order ID)
     - `product_id`
     - `quantity`
     - `price` (unit price)
     - `variants` (JSON object)
     - `shop_name`
     - `shop_address`
     - `created_at`

### Step 3: Add Supabase Action to Fetch Product Details
1. Click the "+" button to add an action
2. **Choose App**: Search for "Supabase"
3. **Choose Action**: Select "Find Row"
4. **Connect Account**: Connect your Supabase account
   - Supabase URL: Your project URL
   - Supabase Key: Your anon/public key
5. **Set Up Action**:
   - **Table**: `products`
   - **Filter by**: `id`
   - **Filter value**: Select `product_id` from webhook data
   - **Select columns**: `name,brand,model,price`
6. Click "Continue" and test the action

### Step 4: Set Up Email Action (Gmail or Email by Zapier)

#### Option A: Using Gmail
1. Click the "+" button to add an action
2. **Choose App**: Search for "Gmail"
3. **Choose Action**: Select "Send Email"
4. **Connect Account**: Connect your Gmail account
5. **Set Up Email**:
   - **To**: Your admin email address
   - **Subject**: 
     ```
     New Order: [Product Brand from Step 3] [Product Model from Step 3]
     ```
   - **Body Type**: HTML
   - **Body**: Use the template below

#### Option B: Using Email by Zapier (Simpler)
1. Click the "+" button to add an action
2. **Choose App**: Search for "Email by Zapier"
3. **Choose Action**: Select "Send Outbound Email"
4. **Set Up Email**:
   - **To**: Your admin email address
   - **Subject**: 
     ```
     New Order: [Product Brand from Step 3] [Product Model from Step 3]
     ```
   - **Body**: Use the template below

### Email Template for Body

```html
<h2>New Order Received</h2>

<h3>Product Details:</h3>
<ul>
  <li><strong>Brand:</strong> [Product Brand from Step 3]</li>
  <li><strong>Model:</strong> [Product Model from Step 3]</li>
  <li><strong>Product Name:</strong> [Product Name from Step 3]</li>
  <li><strong>Selected Variation:</strong> [Variants from webhook - format as needed]</li>
  <li><strong>Quantity:</strong> [Quantity from webhook]</li>
  <li><strong>Price per unit:</strong> ₹[Price from webhook]</li>
  <li><strong>Subtotal:</strong> ₹[Calculated: Quantity × Price]</li>
</ul>

<h3>Shop Details:</h3>
<ul>
  <li><strong>Shop Name:</strong> [Shop Name from webhook]</li>
  <li><strong>Shop Address:</strong> [Shop Address from webhook]</li>
</ul>

<h3>Order Information:</h3>
<ul>
  <li><strong>Order ID:</strong> [ID from webhook]</li>
  <li><strong>Order Date:</strong> [Created At from webhook]</li>
</ul>
```

### Step 5: Calculate Subtotal (Optional - for better formatting)
Before the email step, you can add a "Formatter by Zapier" action:
1. Click "+" to add an action between Supabase and Email
2. **Choose App**: "Formatter by Zapier"
3. **Choose Action**: "Numbers" → "Perform Math Operation"
4. **Set Up**:
   - **Operation**: Multiply
   - **Input 1**: [Quantity from webhook]
   - **Input 2**: [Price from webhook]
5. Use this calculated value in the email body as the Subtotal

### Step 6: Format Variants (Optional)
To display variants nicely:
1. Add "Formatter by Zapier" action
2. **Choose Action**: "Text" → "Replace"
3. **Set Up**:
   - **Input**: [Variants from webhook]
   - **Find**: `{` and `}` and `"` and `,`
   - **Replace**: with spaces or line breaks
4. Use formatted text in email

### Step 7: Test the Complete Zap
1. Click "Test & Continue" on each step
2. Place a test order in your app
3. Check if you receive the email with all details
4. Verify:
   - Product details are correct
   - Price per unit is shown
   - Subtotal is calculated correctly
   - Shop details are included

### Step 8: Turn On Your Zap
1. Click "Publish" or "Turn On Zap"
2. Your Zap is now live!

## Mapping Fields in Zapier

When setting up the email body, map these fields:

| Email Field | Zapier Field | Source |
|------------|--------------|--------|
| Brand | `brand` | Supabase Product (Step 3) |
| Model | `model` | Supabase Product (Step 3) |
| Product Name | `name` | Supabase Product (Step 3) |
| Quantity | `quantity` | Webhook (Step 2) |
| Price per unit | `price` | Webhook (Step 2) |
| Subtotal | `quantity × price` | Calculated (Step 5) |
| Variants | `variants` | Webhook (Step 2) |
| Shop Name | `shop_name` | Webhook (Step 2) |
| Shop Address | `shop_address` | Webhook (Step 2) |
| Order ID | `id` | Webhook (Step 2) |
| Order Date | `created_at` | Webhook (Step 2) |

## Troubleshooting

### Webhook not receiving data
- Check if the database trigger is active in Supabase
- Verify the webhook URL is correct in the trigger
- Test by placing an order and checking Zapier's task history

### Product details not showing
- Verify Supabase connection in Zapier
- Check if the product_id exists in the products table
- Ensure the columns selected match your database schema

### Email not sending
- Check email service connection
- Verify recipient email address
- Check Zapier task history for errors

## Alternative: Using Supabase Edge Function (Current Setup)

Your current setup uses a Supabase Edge Function that sends emails directly via Resend API. The webhook trigger calls this function automatically when an order is placed.

**Pros of Edge Function:**
- Faster (no external service delay)
- More reliable
- Better error handling
- Already includes price in the email

**Pros of Zapier:**
- No code required
- Easy to modify email template
- Can add multiple actions (e.g., send to Slack, update spreadsheet)
- Visual workflow

You can use both methods simultaneously or choose one based on your preference.

## Notes
- The `price` field is now included in the orders table
- Each order email shows the individual product price and calculated subtotal
- For checkout with multiple products, each product generates a separate order and email
- All prices are formatted in Indian Rupees (₹)
