import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import PullToRefresh from 'pulltorefreshjs';
import { registerLicense } from '@syncfusion/ej2-base';
import { checkForUpdates, forceReload } from './shared/utils/versionManager';

// Register Service Worker only in production to avoid dev HMR loops
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // Reload page when new SW takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Ensure we only reload once per update cycle
        if (!window.__swReloaded) {
          window.__swReloaded = true;
          window.location.reload();
        }
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Periodically check for updates
      setInterval(() => registration.update(), 5 * 60 * 1000);
    } catch (e) {
      console.warn('SW registration failed', e);
    }
  });
}

//syncfusion license
registerLicense('Ix0oFS8QJAw9HSQvXkVhQlBad1hJXGFWfVJpTGpQdk5xdV9DaVZUTWY/P1ZhSXxWd0VhXX5acHVQQWhZWEd9XEM=');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 600,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppWithPullToRefresh = () => {
  useEffect(() => {
    // Only run version checks in production to avoid infinite reloads during dev
    if (import.meta.env.PROD && checkForUpdates()) {
      setTimeout(() => forceReload(), 500);
      return;
    }

    const ptr = PullToRefresh.init({
      mainElement: 'body',
      onRefresh() {
        window.location.reload();
      }
    });

    return () => {
      PullToRefresh.destroyAll();
    };
  }, []);

  return <AppRoutes />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="438701484360-sb25nra1cea6vhngasldijinaoroislu.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <AppWithPullToRefresh />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </LocalizationProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);
