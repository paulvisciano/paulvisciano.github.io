const CACHE_VERSION = '2026.02.21.0921';
const CACHE_NAME = `whereispaul-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `whereispaul-dynamic-v${CACHE_VERSION}`;

// Emergency cache buster - disabled to prevent loops
const EMERGENCY_CACHE_BUST = 0;

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
  /manifest\.json$/,
  /moments\/.*\.html$/,  // All moment HTML files
  /components\/.*\.html$/, // All component HTML files
  /moments\/.*\/data\.json$/ // Episode data files
];

// Install service worker but don't force immediate activation
self.addEventListener('install', event => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Don't skip waiting to prevent refresh loops
      // self.skipWaiting(),
      // Cache static assets with error handling
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
        .catch(error => {
          console.error('Service Worker: Failed to cache static assets:', error);
          // Continue anyway - don't block installation
          return Promise.resolve();
        })
    ])
  );
});

// Clean up old caches when the new service worker activates
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating version', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Don't immediately claim control to prevent refresh loops
      // self.clients.claim(),
      // Clean up old caches aggressively to prevent black screen
      caches.keys().then(cacheNames => {
        console.log('Service Worker: Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Don't notify clients to prevent refresh loops
      // self.clients.matchAll().then(clients => {
      //   clients.forEach(client => {
      //     client.postMessage({
      //       type: 'SW_UPDATED',
      //       version: CACHE_VERSION,
      //       emergency: EMERGENCY_CACHE_BUST
      //     });
      //   });
      // })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Always use network-first for navigation requests with emergency fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if response is valid
          if (!response || response.status !== 200) {
            throw new Error('Invalid response');
          }
          
          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(error => {
              console.warn('Service Worker: Failed to cache navigation response:', error);
            });
            
          return response;
        })
        .catch(error => {
          console.warn('Service Worker: Navigation fetch failed:', error);
          // If network fails, try to get from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Last resort: return simple fallback
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Loading...</title>
                  <meta charset="utf-8">
                  <style>
                    body { 
                      font-family: system-ui, sans-serif; 
                      background: #f0f0f0; 
                      color: #333; 
                      padding: 40px;
                      margin: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      text-align: center;
                    }
                    .loading { 
                      font-size: 18px;
                      color: #666;
                    }
                  </style>
                </head>
                <body>
                  <div class="loading">Loading...</div>
                  <script>
                    setTimeout(() => window.location.reload(), 1000);
                  </script>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }
  
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