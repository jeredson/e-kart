import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface OrderSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderSuccessPopup = ({ isOpen, onClose }: OrderSuccessPopupProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const isMobile = window.innerWidth < 1024;
      const duration = isMobile ? 1000 : 3000;
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={`bg-background border-2 border-primary rounded-2xl p-6 sm:p-8 mx-4 shadow-2xl flex flex-col items-center gap-4 transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <div className="relative">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-primary animate-in zoom-in duration-500" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-center">Order Placed!</h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center">Your order has been placed successfully</p>
      </div>
    </div>
  );
};

export default OrderSuccessPopup;
