import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ContentPageLayoutProps {
  title: string;
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export function ContentPageLayout({ title, children, onSearch }: ContentPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar onSearch={onSearch ?? (() => {})} />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </Button>
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-8">{title}</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
