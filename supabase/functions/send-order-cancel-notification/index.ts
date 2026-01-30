import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')

serve(async (req) => {
  try {
    if (!RESEND_API_KEY || !ADMIN_EMAIL) {
      console.error('Missing RESEND_API_KEY or ADMIN_EMAIL')
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY or ADMIN_EMAIL in Edge Function secrets' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const body = await req.json()
    const record = body.record ?? body

    if (!record?.id || !record?.product_id) {
      return new Response(
        JSON.stringify({ error: 'Missing order record or product_id' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Only send if this is a cancel notification (is_canceled = true)
    if (record.is_canceled !== true) {
      return new Response(JSON.stringify({ ok: true, skipped: 'not canceled' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Fetch product details
    const productResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/products?id=eq.${record.product_id}&select=name,brand,model,description`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      }
    )
    const products = await productResponse.json()
    const product = products && products.length > 0 ? products[0] : null

    const variants = record.variants || {}
    const variantText = Object.entries(variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    const productLabel = product
      ? [product.brand, product.model].filter(Boolean).join(' ') || product.name
      : 'Product'

    const createdDate = record.created_at
      ? new Date(record.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'N/A'

    // Use same "from" as working buy email so Resend accepts it (e.g. onboarding@resend.dev)
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Agnes Mobiles Order <onboarding@resend.dev>'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [ADMIN_EMAIL],
        subject: `Order canceled: ${productLabel}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #b91c1c;">Order canceled</h2>
            <p style="color: #666;">An order has been canceled. Details below.</p>
            
            <h3 style="color: #666; margin-top: 20px;">CANCELED ORDER DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.id}</td>
              </tr>
              ${product ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Product:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.name || 'N/A'}</td>
              </tr>
              ${product.brand ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Brand:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${product.brand}</td></tr>` : ''}
              ${product.model ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Model:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${product.model}</td></tr>` : ''}
              ` : ''}
              ${variantText ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Variation:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${variantText}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quantity:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Price per unit:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${Number(record.price || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subtotal:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${(record.quantity * (record.price || 0)).toLocaleString('en-IN')}</td>
              </tr>
            </table>
            
            <h3 style="color: #666; margin-top: 20px;">SHOP</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shop Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.shop_name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shop Address:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.shop_address || 'N/A'}</td>
              </tr>
            </table>
            
            <p style="margin-top: 20px; color: #666;">
              <strong>Original order date:</strong> ${createdDate}
            </p>
          </div>
        `
      })
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Resend API error:', res.status, data)
      return new Response(JSON.stringify({ error: 'Resend failed', details: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 502
      })
    }
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Cancel notification error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
