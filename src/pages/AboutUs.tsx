import { ContentPageLayout } from '@/components/ContentPageLayout';

const AboutUs = () => (
  <ContentPageLayout title="About Us">
    <p className="lead">
      Agnes Mobiles is a B2B platform for mobiles, headphones, and TWS. We help businesses source quality electronics at competitive prices.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Our mission</h2>
      <p>
        We aim to simplify B2B buying with a clear catalog, easy ordering, and reliable delivery so your business can focus on growth.
      </p>
      <h2 className="text-lg font-semibold text-foreground">What we offer</h2>
      <p>
        We stock mobiles, headphones, and TWS from trusted brands. You can browse by category, compare options, and place orders from one place.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Contact</h2>
      <p>
        For partnerships or questions: <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a>.
      </p>
    </section>
  </ContentPageLayout>
);

export default AboutUs;
