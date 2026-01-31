import { ContentPageLayout } from '@/components/ContentPageLayout';

const Contact = () => (
  <ContentPageLayout title="Contact">
    <p className="lead">
      Get in touch with Agnes Mobiles B2B for orders, support, or partnerships.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Email</h2>
      <p>
        For all inquiries: <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline font-medium">catchshelton@gmail.com</a>
      </p>
      <p className="text-sm">
        Use this for order help, product questions, returns, B2B quotes, and general support. We aim to reply within 24 hours on business days.
      </p>
      <h2 className="text-lg font-semibold text-foreground mt-8">Other pages</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="/help" className="text-primary hover:underline">Help Center</a> — Quick links and support</li>
        <li><a href="/shipping" className="text-primary hover:underline">Shipping Info</a> — Delivery and timing</li>
        <li><a href="/returns" className="text-primary hover:underline">Returns</a> — Refunds and exchanges</li>
      </ul>
    </section>
  </ContentPageLayout>
);

export default Contact;
