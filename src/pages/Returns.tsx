import { ContentPageLayout } from '@/components/ContentPageLayout';

const Returns = () => (
  <ContentPageLayout title="Returns & Refunds">
    <p className="lead">
      We want you to be satisfied with your purchase. Here’s our returns and refund policy for Agnes Mobiles B2B.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Return window</h2>
      <p>
        Eligible items can be returned within 7 days of delivery. Products must be unused, in original packaging, and with all accessories.
      </p>
      <h2 className="text-lg font-semibold text-foreground">How to return</h2>
      <p>
        Contact us at <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> with your order number and reason for return. We’ll send you return instructions and a reference number.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Refunds</h2>
      <p>
        Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Exchanges</h2>
      <p>
        For a different variant or product, please place a new order and return the original item as above. We’ll process the refund once the return is complete.
      </p>
    </section>
  </ContentPageLayout>
);

export default Returns;
