// Gifteez PWA Service Worker - Enhanced
const CACHE_VERSION = 'gifteez-v2-2025-10-19';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  images: `${CACHE_VERSION}-images`,
};

// Resources to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Maximum cache sizes
const MAX_CACHE_SIZE = { dynamic: 50, images: 100 };

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS).catch((err) => {
          console.warn('[SW] Some static assets failed to cache:', err);
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip non-http(s) schemes
  if (!request.url.startsWith('http')) return;
  
  // Skip external requests
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  
  // Skip API calls to Firebase
  if (url.hostname.includes('firebase') || url.pathname.includes('/api/')) return;

  event.respondWith(handleFetch(request));
});

// Handle fetch with caching strategy
async function handleFetch(request) {
  const url = new URL(request.url);

  // Network First for HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    return networkFirstStrategy(request);
  }

  // Cache First for images
  if (request.headers.get('accept')?.includes('image')) {
    return cacheFirstStrategy(request, CACHE_NAMES.images);
  }

  // Stale While Revalidate for other assets
  return staleWhileRevalidateStrategy(request);
}

// Network First strategy (with cache fallback)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponse.clone());
      limitCacheSize(CACHE_NAMES.dynamic, MAX_CACHE_SIZE.dynamic);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    // Show offline page for navigation
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    
    return new Response('Offline - content niet beschikbaar', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache First strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      if (cacheName === CACHE_NAMES.images) {
        limitCacheSize(cacheName, MAX_CACHE_SIZE.images);
      }
    }
    return networkResponse;
  } catch (error) {
    return new Response('Resource niet beschikbaar', { status: 404 });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAMES.static);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => console.log('[SW] Background fetch failed:', request.url));
  
  return cachedResponse || fetchPromise;
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Message handler
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map(n => caches.delete(n))))
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach(c => c.postMessage({ type: 'CACHE_CLEARED' })))
    );
  }
});

console.log('SW: Service worker loaded');
