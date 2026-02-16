C:\\Users\\meleeGOD\\Pictures\\Screenshots\\

https://hooks.zapier.com/hooks/catch/26132431/uq8wh4t/

Resend API: re\_Q2qtQcKd\_4J3HViJzbrbjY8KQaHxQ3ZnY

Project ref id: aqcmmfeimioxvcpwpafr

Project URL: https://aqcmmfeimioxvcpwpafr.supabase.co

Service Role API: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY21tZmVpbWlveHZjcHdwYWZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxODM3OSwiZXhwIjoyMDgzNTk0Mzc5fQ.r-FOYCZy3RPLnCxfP6QOPOxs3eLNvCUsaVmga3dWQqc







3\. Send mail for canceling the product

4\. For users also send a mail regarding order placed and canceled (x)





ZAPPIER JS:

// ZAPIER CODE - Formats batch order with all products



const { batch\_id, shop\_name, shop\_address, created\_at, products } = inputData;



const orderDate = new Date(created\_at).toLocaleDateString('en-GB');



let productsText = '';

let total = 0;



products.forEach(p => {

  const variantsText = p.variants \&\& Object.keys(p.variants).length > 0

    ? Object.entries(p.variants).map((\[k, v]) => `${k}: ${v}`).join(', ')

    : '';

 

  const subtotal = p.quantity \* p.price;

  total += subtotal;

 

  productsText += `Product: ${p.name}\\\\\\\\n`;

  if (variantsText) productsText += `Variants: ${variantsText}\\\\\\\\n`;

  productsText += `Quantity: ${p.quantity} × ₹${p.price.toLocaleString('en-IN')} = ₹${subtotal.toLocaleString('en-IN')}\\\\\\\\n\\\\\\\\n`;

});



output = {

  message: `🛒 NEW ORDER\\\\\\\\n\\\\\\\\n📅 Date: ${orderDate}\\\\\\\\n🔢 Batch ID: ${batch\\\\\\\_id}\\\\\\\\n\\\\\\\\n📦 Products:\\\\\\\\n---\\\\\\\\n${productsText}Total: ₹${total.toLocaleString('en-IN')}\\\\\\\\n---\\\\\\\\n\\\\\\\\n🏪 Shop Details:\\\\\\\\nName: ${shop\\\\\\\_name}\\\\\\\\nAddress: ${shop\\\\\\\_address}`

};





Now for the footer: Change the word techstore to Agnes Mobiles - B2B and use the same logo image url which you use for the header logo. Change all the name with techstore to Agnes Mobiles. For the shop section in the header keep: All products(Clicking goes to the main page), Mobiles(Clicking goes to the main page with filtered category with mobile section), Remove Laptops, Headphones (Clicking goes to the main page with filtered Category to headphones), Remove accessories, Add TWS(Clicking goes to the main page with filtered category of TWS. For the Support section: Help center Add a page with your own content based on the website and for the mail to contact is: catchshelton@gmail.com, Add your contents for Shipping info, Returns, Track Order, FAQ's with your idea based on the website. For the Company section: About us, Carrers, Press, Blog, Contact use your own idea based on the website and created contents for this page.



 

