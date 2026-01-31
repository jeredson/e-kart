import { Link } from 'react-router-dom';
import { ContentPageLayout } from '@/components/ContentPageLayout';

const HelpCenter = () => (
  <ContentPageLayout title="Help Center">
    <p className="lead">
      Welcome to Agnes Mobiles B2B Help Center. Find answers and get support for orders, products, and account.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Quick links</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/shipping" className="text-primary hover:underline">Shipping & delivery</Link> — How we ship and estimated times</li>
        <li><Link to="/returns" className="text-primary hover:underline">Returns & refunds</Link> — How to return or exchange</li>
        <li><Link to="/track-order" className="text-primary hover:underline">Track your order</Link> — Check order status</li>
        <li><Link to="/faq" className="text-primary hover:underline">FAQs</Link> — Common questions</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground mt-8">Contact us</h2>
      <p>
        For order support, product questions, or partnership inquiries, email us at{' '}
        <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a>.
        We aim to respond within 24 hours on business days.
      </p>
    </section>
  </ContentPageLayout>
);

export default HelpCenter;
