# Step-by-Step: Cancel Order Email Notification (Supabase Edge Function + Resend)

This guide adds an **email notification when an order is canceled** (user or admin marks the order as canceled). It uses the same stack as your existing buy-order emails: **Supabase Edge Function** and **Resend API**.

---

## Does this affect my existing “buy” order email?

**No.** Your existing setup is unchanged:

| What | Existing “buy” email | New cancel email |
|------|----------------------|------------------|
| **Event** | **INSERT** on `orders` (new order created) | **UPDATE** on `orders` when `is_canceled` becomes `true` |
| **Trigger/Webhook** | `send_order_email_trigger` or Database Webhook on **Insert** | New trigger `send_order_cancel_notification_trigger` on **Update** only |
| **Edge Function** | `send-order-email` or `send-order-notification` | New: `send-order-cancel-notification` |

- **Buy email**: still fires only when a **new order is inserted**.
- **Cancel email**: fires only when an order is **updated** and `is_canceled` is set to `true`.

They are independent; adding the cancel flow does not change the buy flow.

---

## Prerequisites

- Supabase project (Dashboard access).
- Resend account and API key (same as for buy-order emails).
- `orders` table with column `is_canceled` (boolean). If missing, run:
  ```sql
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_canceled BOOLEAN DEFAULT false;
  ```

---

## Step 1: Create the cancel notification Edge Function

The project already includes the function at:

`supabase/functions/send-order-cancel-notification/index.ts`

It:

- Receives the order `record` when the cancel trigger runs.
- Fetches product details from Supabase.
- Sends one email to **ADMIN_EMAIL** via Resend with canceled order details (product, quantity, price, shop, order date).

No code changes are required unless you want to customize the email body or subject.

---

## Step 2: Deploy the Edge Function and set secrets

### 2.1 Deploy

From your project root (where `supabase/` lives):

```bash
npx supabase functions deploy send-order-cancel-notification
```

Use the same Supabase project/link as for your other functions.

### 2.2 Set secrets (same as buy-order email)

The cancel function uses the **same** Resend key and admin email as your existing order emails:

1. Supabase Dashboard → **Edge Functions** → **send-order-cancel-notification** (or **Project Settings** → **Edge Functions**).
2. Under **Secrets**, ensure:
   - `RESEND_API_KEY` = your Resend API key.
   - `ADMIN_EMAIL` = email that should receive cancel (and buy) notifications.

If these are already set for `send-order-email` or `send-order-notification`, they apply to this function too once set at project level.

From CLI you can run:

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxx
npx supabase secrets set ADMIN_EMAIL=admin@yourdomain.com
```

---

## Step 3: Enable the cancel trigger in the database

The cancel email is sent by a **database trigger** that runs only when an order is **updated** and `is_canceled` changes to `true`. This does not run on **insert**, so it does not affect “new order” emails.

### 3.1 Get your project URL and service role key

1. Supabase Dashboard → **Project Settings** (gear) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`).
   - **service_role** key (under “Project API keys”). Keep this secret.

### 3.2 Run the SQL

1. Dashboard → **SQL Editor** → New query.
2. Open `setup_order_cancel_email_trigger.sql` in the project.
3. In that file, replace:
   - `https://YOUR_PROJECT_REF.supabase.co` → your **Project URL** (no trailing slash).
   - `YOUR_SERVICE_ROLE_KEY` → your **service_role** key.
4. Execute the full script.

This will:

- Ensure `pg_net` is available.
- Create the function `send_order_cancel_notification()` that calls your Edge Function when an order is marked canceled.
- Create the trigger `send_order_cancel_notification_trigger` on `orders` **AFTER UPDATE** only.

Your existing **INSERT** trigger (or Database Webhook for insert) for “buy” emails is not modified.

---

## Step 4: Test the cancel email

1. In your app, create a test order (Buy Now or Checkout).
2. Go to **My Orders** (or Admin Order Management).
3. Cancel that order (mark as canceled).
4. Check the inbox for **ADMIN_EMAIL**; you should receive a “Order canceled” email with product and order details.

If you don’t get the email:

- Check **Edge Functions** → **send-order-cancel-notification** → **Logs** for errors.
- Confirm `RESEND_API_KEY` and `ADMIN_EMAIL` are set.
- Confirm the SQL was run and the trigger exists:
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgname = 'send_order_cancel_notification_trigger';
  ```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Use existing `send-order-cancel-notification` Edge Function (no code change needed). |
| 2 | Deploy it and set `RESEND_API_KEY` and `ADMIN_EMAIL` (same as buy emails). |
| 3 | Run `setup_order_cancel_email_trigger.sql` with your Project URL and service_role key. |
| 4 | Test by canceling an order and checking the admin inbox. |

- **Buy order email**: still sent on **INSERT** (new order), unchanged.
- **Cancel order email**: sent on **UPDATE** when `is_canceled` is set to `true`, via the new trigger and Edge Function only.

---

## Optional: Sending cancel email to the customer

The current setup sends the cancel email only to **ADMIN_EMAIL**. To also email the customer:

1. In your Edge Function, use the Supabase Admin API (with the service role key) to fetch the user’s email from `auth.users` by `record.user_id`.
2. Add that email to the `to` array in the Resend request (e.g. `to: [ADMIN_EMAIL, userEmail]`), or send a separate, customer-facing email with a different subject/body.

The trigger and Resend setup stay the same; only the Edge Function logic changes.
