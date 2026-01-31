import { ContentPageLayout } from '@/components/ContentPageLayout';

const Careers = () => (
  <ContentPageLayout title="Careers">
    <p className="lead">
      Join Agnes Mobiles and help us grow B2B commerce in electronics.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Open roles</h2>
      <p>
        We’re a small team focused on product, operations, and customer experience. When we have openings, we’ll list them here and on our job boards.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Why work with us</h2>
      <p>
        You’ll work on a product used by real businesses, with room to own projects and grow. We value clarity, reliability, and good communication.
      </p>
      <h2 className="text-lg font-semibold text-foreground">Apply</h2>
      <p>
        Send your resume and a short note to <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> with the subject “Careers – [Role]”. We’ll get back to you if there’s a fit.
      </p>
    </section>
  </ContentPageLayout>
);

export default Careers;
