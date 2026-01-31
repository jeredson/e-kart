import { ContentPageLayout } from '@/components/ContentPageLayout';

const Blog = () => (
  <ContentPageLayout title="Blog">
    <p className="lead">
      Updates, tips, and news from Agnes Mobiles B2B.
    </p>
    <section className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Coming soon</h2>
      <p>
        We’re setting up our blog with guides on choosing mobiles and audio gear for your business, plus product highlights and company updates.
      </p>
      <p>
        In the meantime, follow us or reach out at <a href="mailto:catchshelton@gmail.com" className="text-primary hover:underline">catchshelton@gmail.com</a> for any questions.
      </p>
    </section>
  </ContentPageLayout>
);

export default Blog;
