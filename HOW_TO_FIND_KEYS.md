# How to Find Your Supabase Project Ref and Service Role Key

## Finding Your Project Reference (Project Ref)

### Method 1: From the URL
When you're in your Supabase Dashboard, look at the URL:
```
https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]/...
```
The project ref is the part after `/project/`

Example: If your URL is `https://supabase.com/dashboard/project/aqcmmfeimioxvcpwpafr/editor`
Your project ref is: `aqcmmfeimioxvcpwpafr`

### Method 2: From Project Settings
1. Go to Supabase Dashboard
2. Click on your project
3. Click **Settings** (gear icon in sidebar)
4. Click **General**
5. Look for **Reference ID** under "General settings"

### Method 3: From Your .env File
Check your `.env` file - the project ref is in your Supabase URL:
```
VITE_SUPABASE_URL=https://aqcmmfeimioxvcpwpafr.supabase.co
                          ^^^^^^^^^^^^^^^^^^^^
                          This is your project ref
```

## Finding Your Service Role Key

⚠️ **WARNING**: The service role key bypasses Row Level Security. Never expose it in client-side code!

### Steps:
1. Go to Supabase Dashboard
2. Click on your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API**
5. Scroll down to **Project API keys**
6. Find **service_role** key (NOT the anon/public key)
7. Click the eye icon to reveal it
8. Copy the key (starts with `eyJ...`)

## Quick Setup for Webhook

Based on your current project, your webhook URL should be:
```
https://aqcmmfeimioxvcpwpafr.supabase.co/functions/v1/send-order-notification
```

### Webhook Configuration:
- **Name**: `send-order-notification`
- **Table**: `orders`
- **Events**: ✓ Insert
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://aqcmmfeimioxvcpwpafr.supabase.co/functions/v1/send-order-notification`
- **HTTP Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer [PASTE-YOUR-SERVICE-ROLE-KEY-HERE]
  ```

## Security Note
- The service role key should ONLY be used in:
  - Backend servers
  - Database functions/triggers
  - Webhooks
  - Edge functions (as environment variable)
- NEVER commit it to Git
- NEVER use it in frontend code
