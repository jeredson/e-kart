import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')
const ADDITIONAL_EMAILS = Deno.env.get('ADDITIONAL_EMAILS') || ''

serve(async (req) => {
  try {
    const { batch_id, shop_name, shop_address, created_at, products } = await req.json()
    
    const d = new Date(created_at)
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    
    let productsHtml = ''
    let total = 0
    
    products.forEach(p => {
      const vars = p.variants || {}
      const variantStr = Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join(', ')
      const subtotal = p.quantity * p.price
      total += subtotal
      
      productsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${variantStr || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${p.price.toLocaleString('en-IN')}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
      `
    })
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Agnes Mobiles Order <onboarding@resend.dev>',
        to: [ADMIN_EMAIL, ...ADDITIONAL_EMAILS.split(',').filter(e => e.trim())],
        subject: `🛒 New Order - ${shop_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>🛒 NEW ORDER</h2>
            <p><strong>📅 Date:</strong> ${date}</p>
            <p><strong>🔢 Batch ID:</strong> ${batch_id}</p>
            <h3>📦 Products:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: left;">Variants</th>
                  <th style="padding: 8px; text-align: left;">Qty</th>
                  <th style="padding: 8px; text-align: left;">Price</th>
                  <th style="padding: 8px; text-align: left;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
                <tr>
                  <td colspan="4" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 8px; font-weight: bold;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            <h3>🏪 Shop Details:</h3>
            <p><strong>Name:</strong> ${shop_name}</p>
            <p><strong>Address:</strong> ${shop_address}</p>
          </div>
        `
      })
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { 'Content-Type': 'application/json' }, status: 400 })
  }
})
