const CACHE_VERSION = '2025.09.01.1532';
const CACHE_NAME = `whereispaul-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `whereispaul-dynamic-v${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/lib/tailwind.min.js',
  '/lib/react.production.min.js',
  '/lib/react-dom.production.min.js',
  '/lib/babel.min.js',
  '/lib/three.min.js',
  '/lib/d3.min.js',
  '/lib/globe.gl.min.js',
  '/components/styles.css',
  '/components/blogPostDrawer.css',
  '/components/footer.css',
  '/components/globe.css',
  '/components/globe.js',
  '/components/blogPostDrawer.js',
  '/components/footer.js',
  '/components/app.js'
];

// Add paths that should use network-first strategy
const NETWORK_FIRST_PATTERNS = [
  /moments\.js$/,
  /icons\/.*\.png$/,
  /manifest\.json$/
];

// Force the service worker to activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Skip waiting to activate the new service worker immediately
      self.skipWaiting(),
      // Cache static assets
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
    ])
  );
});

// Clean up old caches when the new service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Check if the request matches any network-first patterns
  const shouldUseNetworkFirst = NETWORK_FIRST_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  );
  
  if (shouldUseNetworkFirst) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
}); 