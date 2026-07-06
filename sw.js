/**
 * Service Worker for Catlovers
 * Implements advanced caching strategies for optimal performance
 */

const CACHE_NAME = 'catlovers-v6';
const PRE_CACHE_URLS = [
  './',
  './index.html',
  './about.html',
  './adoption.html',
  './benefits.html',
  './cats.html',
  './blog.html',
  './quiz.html',
  './post.html',
  './happy-endings.html',
  './support.html',
  './privacy.html',
  './terms.html',
  './404.html',
  './icon-192.webp',
  './icon-512.webp',
  './site.webmanifest',
  './css/preflight.css',
  './css/main.css',
  './img/background-broken-noise.webp',
  './img/catlovers.jpg'
];


/**
 * Install event - pre-cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell');
        return cache.addAll(PRE_CACHE_URLS);
      })
      .then(() => {
        // Store cache installation timestamp
        return caches.open('cache-metadata').then((metaCache) => {
          return metaCache.put('install-time', new Response(Date.now().toString()));
        });
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[ServiceWorker] Pre-cache failed:', error);
      })
  );
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      // Delete old caches
      await Promise.all(
        cacheNames.map(async (cache) => {
          if (cache !== CACHE_NAME && cache !== 'cache-metadata' &&
              !Object.values(RUNTIME_CACHE_STRATEGIES).some(s => s.options.cacheName === cache)) {
            console.log('[ServiceWorker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );

      // Check cache expiration
      try {
        const metaCache = await caches.open('cache-metadata');
        const installTimeResponse = await metaCache.get('install-time');
        if (installTimeResponse) {
          const installTime = parseInt(await installTimeResponse.text());
          const now = Date.now();

          if (now - installTime > CACHE_EXPIRATION_TIME) {
            console.log('[ServiceWorker] Cache expired, clearing all caches');
            await caches.delete(CACHE_NAME);
            await metaCache.put('install-time', new Response(Date.now().toString()));
          }
        }
      } catch (error) {
        console.error('[ServiceWorker] Error checking cache expiration:', error);
      }

      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for fonts and analytics if needed)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine which strategy to use based on request
  const strategy = getStrategyForRequest(request);

  if (strategy === 'NetworkOnly') {
    event.respondWith(fetch(request));
    return;
  }

  if (strategy === 'CacheFirst') {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (strategy === 'NetworkFirst') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (strategy === 'StaleWhileRevalidate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: network only
  event.respondWith(fetch(request));
});

/**
 * Determine caching strategy for a request
 * @param {Request} request - The fetch request
 * @returns {string} Strategy name
 */
function getStrategyForRequest(request) {
  const url = request.url;

  // HTML pages: NetworkFirst
  if (url.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    return 'NetworkFirst';
  }

  // Static assets (images, fonts, CSS, JS): CacheFirst
  if (/\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|woff2?|ttf|eot|otf|json)$/.test(url.pathname)) {
    return 'CacheFirst';
  }

  // Default: NetworkFirst
  return 'NetworkFirst';
}

/**
 * Cache First strategy - return cached response, fallback to network
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline - Resource not cached', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First strategy - try network, fallback to cache
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('./index.html');
    }
    return new Response('Offline - No cached version available', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale While Revalidate strategy - return cached immediately, update in background
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response('Offline', { status: 503 });
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

/**
 * Handle push notifications (future implementation)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New content available',
      icon: './icon-192.webp',
      badge: './favicon-96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || './'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Catlovers', options)
    );
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[ServiceWorker] Service Worker loaded with advanced caching strategies');
