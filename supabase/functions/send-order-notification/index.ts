import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
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
        subject: `New Order: ${product?.brand || product?.name || 'Product'} ${product?.model || ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">A new order has been received.</h2>
            
            <h3 style="color: #666; margin-top: 20px;">PRODUCT DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${product ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Product Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.name || 'N/A'}</td>
              </tr>
              ${product.brand ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Brand:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.brand}</td>
              </tr>
              ` : ''}
              ${product.model ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Model:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.model}</td>
              </tr>
              ` : ''}
              ${product.description ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Description:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.description}</td>
              </tr>
              ` : ''}
              ` : '<tr><td colspan="2" style="padding: 8px; color: #999;">Product details not available</td></tr>'}
              ${variantText ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Selected Variation:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${variantText}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Quantity:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Price per unit:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${Number(record.price).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Subtotal:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">₹${(record.quantity * record.price).toLocaleString('en-IN')}</td>
              </tr>
            </table>
            
            <h3 style="color: #666; margin-top: 20px;">SHOP DETAILS</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shop Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.shop_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Shop Address:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${record.shop_address}</td>
              </tr>
            </table>
            
            <p style="margin-top: 20px; color: #666;">
              <strong>Batch ID:</strong> ${record.id || 'N/A'}<br>
              <strong>Order Date:</strong> ${record.created_at || new Date().toISOString()}
            </p>
          </div>
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
