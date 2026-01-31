import { ContentPageLayout } from '@/components/ContentPageLayout';

const TrackOrder = () => (
  <ContentPageLayout title="Track Order">
    <p className="lead">
      Check the status of your Agnes Mobiles B2B order.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Where to track</h2>
      <p>
        After your order is shipped, you’ll receive an email with a tracking link and number. Use that link to see real-time status with our courier partner.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Order status in app</h2>
      <p>
        Log in and go to <strong>My Orders</strong> to see all your orders. Each order shows status: Pending, Shipped, or Delivered. Click an order for more details.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Delays or issues</h2>
      <p>
        If tracking hasn’t updated or your order is delayed, email us at{' '}
        <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> with your order ID. We’ll follow up with the courier and get back to you.
      </p>
    </section>
  </ContentPageLayout>
);

export default TrackOrder;
