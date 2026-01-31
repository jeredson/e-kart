import { ContentPageLayout } from '@/components/ContentPageLayout';

const ShippingInfo = () => (
  <ContentPageLayout title="Shipping Info">
    <p className="lead">
      We deliver across India. Here’s how shipping works for Agnes Mobiles B2B orders.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Delivery time</h2>
      <p>
        Standard delivery is 3–7 business days after dispatch. Express options may be available at checkout for select areas.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Shipping charges</h2>
      <p>
        Shipping cost is calculated at checkout based on your address and order size. B2B bulk orders may qualify for free or discounted shipping.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Order processing</h2>
      <p>
        Orders are processed on business days. You’ll receive an email with tracking details once your order is shipped.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Need help?</h2>
      <p>
        Questions about your shipment? Email <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> with your order number.
      </p>
    </section>
  </ContentPageLayout>
);

export default ShippingInfo;
