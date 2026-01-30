import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures the device back button (e.g. in Median webview) navigates in-app
 * to the previous page or home instead of closing the application.
 *
 * - On non-home pages with no in-app history: injects "/" so back goes home.
 * - On home: keeps a guard state so back from home doesn't exit the app.
 */
export function BackNavigationHandler() {
  const location = useLocation();

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

  // When we're on home and one more back would exit the app, push a guard so
  // back stays in-app (re-push only when history.length === 1).
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/' && window.history.length === 1) {
        window.history.pushState({ medianBackGuard: true }, '', '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return null;
}
