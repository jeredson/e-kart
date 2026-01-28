# BEGINNER GUIDE: Supabase Email Notifications (No Zapier!)

## Why This is Better:
- ✅ **Free** (no Zapier subscription)
- ✅ **Simpler** (all in Supabase)
- ✅ **Faster** (direct email sending)
- ✅ **Supports multiple products** automatically

---

## Step 1: Get Resend API Key (5 minutes)

### 1.1 Sign Up for Resend
1. Go to https://resend.com
2. Click **Sign Up** button
3. Enter your email and create password
4. Verify your email

### 1.2 Get API Key
1. After login, look at left sidebar
2. Click **API Keys**
3. Click **Create API Key** button
4. Give it a name like "E-Kart Orders"
5. Click **Create**
6. **COPY THE KEY** (starts with `re_...`) - save it in notepad!

---

## Step 2: Find Your Supabase Info (3 minutes)

### 2.1 Open Your Supabase Project
1. Go to https://supabase.com/dashboard
2. Click on your **e-kart** project

### 2.2 Get Project URL and Reference ID
1. Look at your browser URL bar
2. It looks like: `https://supabase.com/dashboard/project/abcdefgh`
3. The part after `/project/` is your **Project Reference ID** (example: `abcdefgh`)
4. Your **Project URL** is: `https://abcdefgh.supabase.co` (replace `abcdefgh` with yours)
5. **SAVE BOTH** in notepad!

### 2.3 Get Service Role Key
1. In Supabase Dashboard, click **Settings** (gear icon at bottom left)
2. Click **API** in the settings menu
3. Scroll down to **Project API keys**
4. Find **service_role** key
5. Click **Reveal** button
6. **COPY THE KEY** (starts with `eyJ...`) - save it in notepad!

---

## Step 3: Install Supabase CLI (2 minutes)

### 3.1 Download Supabase CLI for Windows
1. Go to https://github.com/supabase/cli/releases/latest
2. Scroll down to **Assets**
3. Download **supabase_windows_amd64.zip**
4. Extract the ZIP file
5. You'll see `supabase.exe`

### 3.2 Move to Easy Location
1. Create folder: `C:\supabase`
2. Move `supabase.exe` to `C:\supabase\supabase.exe`

### 3.3 Add to PATH
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click **Advanced** tab
3. Click **Environment Variables** button
4. Under **User variables**, find **Path**, click **Edit**
5. Click **New**
6. Type: `C:\supabase`
7. Click **OK** on all windows
8. **Close and reopen** Command Prompt

### 3.4 Test Installation
Open new Command Prompt and type:
```bash
supabase --version
```
You should see version number

---

## Step 4: Deploy Edge Function (5 minutes)

### 4.1 Navigate to Your Project
In terminal, type:
```bash
cd f:\Projects\e-kart
```

### 4.2 Login to Supabase
Type:
```bash
supabase login
```
- A browser window will open
- Click **Authorize**
- Go back to terminal

### 4.3 Link Your Project
Type (replace `abcdefgh` with YOUR project ref from Step 2.2):
```bash
supabase link --project-ref abcdefgh
```

### 4.4 Set Resend API Key
Type (replace with YOUR Resend key from Step 1.2):
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```

### 4.5 Set Your Email
Type:
```bash
supabase secrets set ADMIN_EMAIL=agnesm0bil3s@gmail.com
```

### 4.6 Deploy Function
Type:
```bash
supabase functions deploy send-order-email
```
Wait for "Deployed!" message

---

## Step 5: Update SQL (3 minutes)

### 5.1 Open SQL File
1. Open `SUPABASE_EMAIL_WEBHOOK.sql` in your code editor
2. Find line 17 (has `YOUR_SUPABASE_PROJECT_URL`)
3. Replace with: `https://abcdefgh.supabase.co/functions/v1/send-order-email`
   - Use YOUR project URL from Step 2.2
4. Find line 18 (has `YOUR_SUPABASE_SERVICE_ROLE_KEY`)
5. Replace with your service_role key from Step 2.3
6. Save the file

### 5.2 Run SQL in Supabase
1. Go to Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query** button
4. Copy ALL content from `SUPABASE_EMAIL_WEBHOOK.sql`
5. Paste into the query editor
6. Click **Run** button (or press Ctrl+Enter)
7. You should see: "Email function enabled"

---

## Step 6: Test It! (1 minute)

1. Go to your e-kart website
2. Place a test order (Buy Now or Checkout)
3. Check your email: **agnesm0bil3s@gmail.com**
4. You should receive a beautiful HTML email with order details!

---

## Troubleshooting

### "Command not found: supabase"
- Restart your terminal and try again
- Make sure Node.js is installed: `node --version`

### "Failed to deploy function"
- Check you're in the right folder: `cd f:\Projects\e-kart`
- Make sure you ran `supabase login` first

### "No email received"
- Check Supabase Dashboard → Edge Functions → Logs
- Make sure you set ADMIN_EMAIL correctly
- Check spam folder

---

## What You'll Receive:

```
From: E-Kart Orders <orders@yourdomain.com>
To: agnesm0bil3s@gmail.com
Subject: 🛒 New Order - Chennai Mobiles

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

---

## Cost: 100% FREE
- Resend: 100 emails/day (free forever)
- Supabase Edge Functions: Included in free tier
- Total: **₹0/month** vs Zapier's ₹1,600/month
