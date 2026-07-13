/* Custom Service Worker to auto-activate updates */

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', () => {
  // Ensure the new SW moves to activate ASAP 
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of clients immediately
  event.waitUntil(self.clients.claim());
});

// If you use Workbox at build time, it will inject precache manifest below.
// For dev environments, you can optionally import the dev-dist sw for routing.
// importScripts('/dev-dist/workbox-54d0af47.js');
// workbox.precacheAndRoute(self.__WB_MANIFEST || []);
