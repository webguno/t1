const CACHE_NAME = 'taskearn-v5-safe';
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. IGNORE Supabase/API requests (Always Network Only)
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // 2. Browser Extensions/Chrome Schemes (Ignore)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. Network First Strategy (Try Network -> Fallback to Cache)
  // This ensures users always get the latest version if online.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone and Cache the fresh response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If Network Fails, try Cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If strictly an HTML navigation request and not in cache, return index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});