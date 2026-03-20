import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import { BackNavigationHandler } from "@/components/BackNavigationHandler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminBrands from "./pages/AdminBrands";
import BrandProducts from "./pages/BrandProducts";
import UserOrders from "./pages/UserOrders";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import HelpCenter from "./pages/HelpCenter";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import TrackOrder from "./pages/TrackOrder";
import FAQ from "./pages/FAQ";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <BackNavigationHandler />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/brands/:brandName" element={<BrandProducts />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/brands" element={<AdminBrands />} />
                <Route path="/orders" element={<UserOrders />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/shipping" element={<ShippingInfo />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/press" element={<Press />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileBottomNav />
            </BrowserRouter>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
