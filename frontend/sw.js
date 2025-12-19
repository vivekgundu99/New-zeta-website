// frontend/sw.js
const CACHE_NAME = 'zeta-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/analytics.html',
  '/style.css',
  '/app.js',
  '/login.js',
  '/admin.js',
  '/config.js',
  '/js/state-manager.js',
  '/js/api-client.js',
  '/js/notifications.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip chrome extensions and API calls
  if (event.request.url.includes('chrome-extension://') || 
      event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page or fallback
          return new Response('Offline');
        });
      })
  );
});
// Background sync for quiz answers
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-answers') {
    event.waitUntil(syncQuizAnswers());
  }
});

async function syncQuizAnswers() {
  // Implement background sync logic here
  console.log('Syncing quiz answers...');
}