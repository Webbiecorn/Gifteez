// Gifteez PWA Service Worker
const CACHE_VERSION = 'gifteez-v1.0.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  self.skipWaiting();
});

// Activate event - Clean up old service workers
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Only handle valid requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) schemes
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Network-first strategy with error handling
  event.respondWith(
    fetch(event.request)
      .catch((error) => {
        console.log('SW: Fetch failed for:', event.request.url);
        // Return a basic response instead of failing
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

console.log('SW: Service worker loaded');
