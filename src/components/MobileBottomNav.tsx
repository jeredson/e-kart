import { Link, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (location.pathname === '/orders') setActiveTab('orders');
    else if (location.pathname === '/') setActiveTab('favorites');
    else setActiveTab('');
  }, [location]);

  if (!user) return null;

  const tabs = [
    { id: 'favorites', icon: Heart, label: 'Favorites', path: '/', badge: favorites.length, action: 'favorites' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', path: '/', badge: totalItems, action: 'cart' },
    { id: 'orders', icon: Package, label: 'Orders', path: '/orders', badge: 0 },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    if (tab.action === 'favorites') {
      document.querySelector('[data-favorites-trigger]')?.dispatchEvent(new Event('click', { bubbles: true }));
    } else if (tab.action === 'cart') {
      document.querySelector('[data-cart-trigger]')?.dispatchEvent(new Event('click', { bubbles: true }));
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-4 rounded-3xl bg-background/70 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return tab.path ? (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300"
                style={{
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  background: isActive ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'transparent',
                }}
              >
                <div className="relative">
                  <Icon 
                    className="w-6 h-6 transition-all duration-300" 
                    style={{
                      color: isActive ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />
                  {tab.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span 
                  className="text-xs font-medium transition-all duration-300"
                  style={{
                    color: isActive ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"
                  />
                )}
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="relative flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300"
                style={{
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  background: isActive ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'transparent',
                }}
              >
                <div className="relative">
                  <Icon 
                    className="w-6 h-6 transition-all duration-300" 
                    style={{
                      color: isActive ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                      strokeWidth: isActive ? 2.5 : 2,
                    }}
                  />
                  {tab.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span 
                  className="text-xs font-medium transition-all duration-300"
                  style={{
                    color: isActive ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
