// Gifteez PWA Service Worker
const CACHE_VERSION = 'gifteez-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  event.waitUntil(self.clients.claim());
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Basic pass-through for now
  event.respondWith(fetch(event.request));
});

console.log('SW: Service worker loaded');
