import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Ensures the device back button (e.g. in Median webview or mobile browsers)
 * navigates in-app to the previous page or home instead of closing the application.
 *
 * - On non-home pages with no in-app history: goes to home.
 * - On home: prevents app from closing by maintaining history.
 */
export function BackNavigationHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname;
    const isHome = pathname === '/';

    // When we're on a subpage and there's only one history entry (e.g. deep link
    // or app opened directly on this page), inject "/" as the previous entry so
    // the first back goes to home instead of closing the app.
    if (!isHome && window.history.length <= 1) {
      window.history.replaceState({ key: 'median-back-root' }, '', '/');
      window.history.pushState({ key: 'median-back-current' }, '', pathname + location.search);
    }
  }, [location.pathname, location.search]);

  // When we're on home with a single entry, push a guard so back has something to pop
  // and we can re-push in popstate to avoid closing the app.
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname !== '/') return;

    if (window.history.length === 1) {
      window.history.pushState({ medianBackGuard: true }, '', '/');
    }
  }, [location.pathname]);

  // Handle popstate to prevent app from closing
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const currentPath = window.location.pathname;
      
      // If we're on home and about to exit, prevent it
      if (currentPath === '/' && window.history.length === 1) {
        e.preventDefault();
        window.history.pushState({ medianBackGuard: true }, '', '/');
        return;
      }
      
      // If we're on a subpage with no history, go to home
      if (currentPath !== '/' && window.history.length <= 1) {
        e.preventDefault();
        navigate('/', { replace: true });
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return null;
}
