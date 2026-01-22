import { Link, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import CartDrawer from './CartDrawer';
import FavoritesDrawer from './FavoritesDrawer';
import OrdersDrawer from './OrdersDrawer';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    setActiveTab('');
  }, [location]);

  useEffect(() => {
    // Check if screen width is less than 1024px
    const checkWidth = () => {
      setIsVisible(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const handleModalOpen = () => setHideNav(true);
    const handleModalClose = () => setHideNav(false);
    window.addEventListener('productModalOpen', handleModalOpen);
    window.addEventListener('productModalClose', handleModalClose);
    return () => {
      window.removeEventListener('productModalOpen', handleModalOpen);
      window.removeEventListener('productModalClose', handleModalClose);
    };
  }, []);

  if (!user || !isVisible || hideNav) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
      <div className="mx-3 mb-3 rounded-2xl bg-background/70 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden pointer-events-auto">
        <div className="flex items-center justify-around px-1 py-2">
          {/* Favorites */}
          <FavoritesDrawer>
            <button
              onClick={() => setActiveTab('favorites')}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300"
              style={{
                transform: activeTab === 'favorites' ? 'scale(1.05)' : 'scale(1)',
                background: activeTab === 'favorites' ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'transparent',
              }}
            >
              <div className="relative">
                <Heart 
                  className="w-5 h-5 transition-all duration-300" 
                  style={{
                    color: activeTab === 'favorites' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                    strokeWidth: activeTab === 'favorites' ? 2.5 : 2,
                  }}
                />
                {favorites.length > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    {favorites.length}
                  </Badge>
                )}
              </div>
              <span 
                className="text-[10px] font-medium transition-all duration-300"
                style={{
                  color: activeTab === 'favorites' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                  opacity: activeTab === 'favorites' ? 1 : 0.7,
                }}
              >
                Favorites
              </span>
            </button>
          </FavoritesDrawer>

          {/* Cart */}
          <CartDrawer>
            <button
              onClick={() => setActiveTab('cart')}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300"
              style={{
                transform: activeTab === 'cart' ? 'scale(1.05)' : 'scale(1)',
                background: activeTab === 'cart' ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'transparent',
              }}
            >
              <div className="relative">
                <ShoppingCart 
                  className="w-5 h-5 transition-all duration-300" 
                  style={{
                    color: activeTab === 'cart' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                    strokeWidth: activeTab === 'cart' ? 2.5 : 2,
                  }}
                />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <span 
                className="text-[10px] font-medium transition-all duration-300"
                style={{
                  color: activeTab === 'cart' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                  opacity: activeTab === 'cart' ? 1 : 0.7,
                }}
              >
                Cart
              </span>
            </button>
          </CartDrawer>

          {/* Orders */}
          <OrdersDrawer>
            <button
              onClick={() => setActiveTab('orders')}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300"
              style={{
                transform: activeTab === 'orders' ? 'scale(1.05)' : 'scale(1)',
                background: activeTab === 'orders' ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)' : 'transparent',
              }}
            >
              <Package 
                className="w-5 h-5 transition-all duration-300" 
                style={{
                  color: activeTab === 'orders' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                  strokeWidth: activeTab === 'orders' ? 2.5 : 2,
                }}
              />
              <span 
                className="text-[10px] font-medium transition-all duration-300"
                style={{
                  color: activeTab === 'orders' ? 'rgb(var(--primary-rgb, 59, 130, 246))' : 'currentColor',
                  opacity: activeTab === 'orders' ? 1 : 0.7,
                }}
              >
                Orders
              </span>
            </button>
          </OrdersDrawer>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
