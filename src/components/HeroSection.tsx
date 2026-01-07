import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              New Year Sale — Up to 40% Off
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Premium Tech
              <span className="block text-primary">For Everyone</span>
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-md">
              Discover the latest smartphones, laptops, and accessories. 
              Quality products, unbeatable prices.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="shadow-glow group" onClick={onExplore}>
                Explore Products
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Deals
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80"
              alt="Latest smartphones and tech gadgets"
              className="relative rounded-3xl shadow-elevated w-full object-cover aspect-[4/3]"
            />
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-elevated animate-scale-in hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">iPhone 15 Pro</div>
                  <div className="text-primary font-bold">₹1,199</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
