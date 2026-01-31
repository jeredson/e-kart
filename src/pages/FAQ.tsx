import { ContentPageLayout } from '@/components/ContentPageLayout';

const FAQ = () => (
  <ContentPageLayout title="Frequently Asked Questions">
    <p className="lead mb-8">
      Common questions about Agnes Mobiles B2B — ordering, shipping, returns, and more.
    </p>
    <section className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-foreground">How do I place an order?</h2>
        <p className="mt-2">
          Browse products, add items to cart (or use Buy Now for a single product), then go to Checkout. Sign in or create an account, enter shipping details, and complete payment.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">What payment methods do you accept?</h2>
        <p className="mt-2">
          We accept major cards and other payment options available at checkout. B2B customers can contact us for invoice or bulk payment arrangements.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">How long does shipping take?</h2>
        <p className="mt-2">
          Standard delivery is 3–7 business days after dispatch. You’ll get a tracking link by email once the order is shipped.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">Can I return or exchange a product?</h2>
        <p className="mt-2">
          Yes. Eligible items can be returned within 7 days of delivery. See our <a href="/returns" className="text-primary hover:underline">Returns page</a> for full details and how to start a return.
        </p>
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">How do I contact support?</h2>
        <p className="mt-2">
          Email us at <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> for orders, products, or account help. We respond within 24 hours on business days.
        </p>
      </div>
    </section>
  </ContentPageLayout>
);

export default FAQ;
