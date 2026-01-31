import { Link } from 'react-router-dom';
import { branding } from '@/config/branding';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { label: 'All Products', to: '/' },
    { label: 'Mobiles', to: '/?category=Mobiles' },
    { label: 'Headphones', to: '/?category=Headphones' },
    { label: 'TWS', to: '/?category=TWS' },
  ];

  const supportLinks = [
    { label: 'Help Center', to: '/help' },
    { label: 'Shipping Info', to: '/shipping' },
    { label: 'Returns', to: '/returns' },
    { label: 'Track Order', to: '/track-order' },
    { label: "FAQ's", to: '/faq' },
  ];

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={branding.logoUrl} alt={branding.siteName} className="w-10 h-10 rounded-xl object-cover" />
              <span className="font-display font-bold text-xl">Agnes Mobiles - B2B</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted B2B destination for premium mobiles, headphones, and TWS. Quality electronics for businesses.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.to + link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Agnes Mobiles. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
