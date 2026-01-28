# ALTERNATIVE: Supabase Edge Function (No Zapier Needed!)

## Why This is Better:
- ✅ **Free** (no Zapier subscription)
- ✅ **Simpler** (all in Supabase)
- ✅ **Faster** (direct email sending)
- ✅ **Supports multiple products** automatically

## Setup Steps:

### 1. Get Resend API Key (Free)
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day)
3. Get your API key

### 2. Deploy Edge Function
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_Q2qtQcKd_4J3HViJzbrbjY8KQaHxQ3ZnY
supabase secrets set ADMIN_EMAIL=agnesm0bil3s@gmail.com

# Deploy function
supabase functions deploy send-order-email
```

### 3. Update SQL
1. Open `SUPABASE_EMAIL_WEBHOOK.sql`
2. Replace line 17: `YOUR_SUPABASE_PROJECT_URL` with your project URL
   - Example: `https://abcdefgh.supabase.co`
3. Replace line 18: `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your service role key
   - Find in: Supabase Dashboard → Settings → API → service_role key
4. Run the SQL in Supabase SQL Editor

### 4. Test
Place an order and check your email!

## Email Format:
```
🛒 NEW ORDER

📅 Date: 28/01/2026 13:35
🔢 Batch ID: 6c7b2244-a494-4605-b4e7-900884a20d65

📦 Products:
┌─────────────────┬──────────────────┬─────┬─────────┬──────────┐
│ Product         │ Variants         │ Qty │ Price   │ Subtotal │
├─────────────────┼──────────────────┼─────┼─────────┼──────────┤
│ OnePlus 15R 5G  │ Color: Black     │ 2   │ ₹47,999 │ ₹95,998  │
│ Oppo A59 5G     │ Ram: 12GB        │ 1   │ ₹13,994 │ ₹13,994  │
└─────────────────┴──────────────────┴─────┴─────────┴──────────┘
                                              Total: ₹1,09,992

🏪 Shop Details:
Name: Chennai Mobiles
Address: Chennai
```

## Cost Comparison:
- **Zapier**: $19.99/month (750 tasks)
- **Supabase + Resend**: FREE (100 emails/day)
