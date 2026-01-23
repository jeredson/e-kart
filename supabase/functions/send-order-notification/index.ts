import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // Fetch product details
    const productResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/products?id=eq.${record.product_id}&select=name,brand,model`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      }
    )
    const products = await productResponse.json()
    const product = products[0]

    // Format variants
    const variants = record.variants || {}
    const variantText = Object.entries(variants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'E-Kart Orders <orders@yourdomain.com>',
        to: [ADMIN_EMAIL],
        subject: `New Order: ${product?.brand || 'N/A'} ${product?.model || product?.name || 'Product'}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Product Details:</strong></p>
          <ul>
            <li><strong>Brand:</strong> ${product?.brand || 'N/A'}</li>
            <li><strong>Model:</strong> ${product?.model || product?.name || 'N/A'}</li>
            <li><strong>Selected Variation:</strong> ${variantText || 'None'}</li>
            <li><strong>Quantity:</strong> ${record.quantity}</li>
            <li><strong>Price per unit:</strong> ₹${Number(record.price).toLocaleString('en-IN')}</li>
            <li><strong>Subtotal:</strong> ₹${(record.quantity * record.price).toLocaleString('en-IN')}</li>
          </ul>
          <p><strong>Shop Details:</strong></p>
          <ul>
            <li><strong>Shop Name:</strong> ${record.shop_name}</li>
            <li><strong>Shop Address:</strong> ${record.shop_address}</li>
          </ul>
          <p><strong>Order ID:</strong> ${record.id}</p>
          <p><strong>Order Date:</strong> ${new Date(record.created_at).toLocaleString()}</p>
        `
      })
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
