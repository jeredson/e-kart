import { ContentPageLayout } from '@/components/ContentPageLayout';

const Press = () => (
  <ContentPageLayout title="Press">
    <p className="lead">
      Media and press inquiries for Agnes Mobiles B2B.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">About Agnes Mobiles</h2>
      <p>
        Agnes Mobiles is a B2B platform for mobiles, headphones, and TWS. We serve businesses that need a simple, reliable way to order electronics.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Press kit & quotes</h2>
      <p>
        For logos, product images, or official statements, contact our team at{' '}
        <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> with the subject “Press”.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Interviews</h2>
      <p>
        For interview requests or story ideas, email <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a>. We’ll respond as soon as we can.
      </p>
    </section>
  </ContentPageLayout>
);

export default Press;
