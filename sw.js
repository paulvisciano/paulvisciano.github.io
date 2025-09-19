const CACHE_VERSION = '2025.09.19.1853';
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
              // Last resort: return basic HTML to prevent black screen
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Paul's Memory System - Emergency Boot</title>
                  <meta charset="utf-8">
                  <style>
                    body { 
                      font-family: monospace; 
                      background: #000; 
                      color: #00ff00; 
                      padding: 20px;
                      margin: 0;
                    }
                    .terminal { 
                      border: 1px solid #00ff00; 
                      border-radius: 8px; 
                      padding: 20px; 
                      background: rgba(0, 20, 0, 0.8);
                      max-width: 600px;
                      margin: 50px auto;
                    }
                    .blink { animation: blink 1s infinite; }
                    @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
                    button { 
                      background: #00ff00; 
                      color: #000; 
                      border: none; 
                      padding: 10px 20px; 
                      margin: 10px; 
                      cursor: pointer; 
                      font-family: monospace;
                      border-radius: 4px;
                    }
                  </style>
                </head>
                <body>
                  <div class="terminal">
                    <div>🧠 PAUL'S MEMORY SYSTEM v2.0 - EMERGENCY MODE</div>
                    <br>
                    <div>> System Status: OFFLINE</div>
                    <div>> Memory Bank: DISCONNECTED</div>
                    <div>> Cache: CORRUPTED</div>
                    <div>> Initiating emergency protocols...</div>
                    <br>
                    <div class="blink">> Attempting memory recovery...</div>
                    <br>
                    <div>Emergency Actions:</div>
                    <button onclick="location.reload(true)">🔄 Force Refresh</button>
                    <button onclick="clearAllCachesAndReload()">🗑️ Clear Cache</button>
                    <button onclick="window.location.href = '/?nocache=' + Date.now()">🚀 Fresh Start</button>
                    <script>
                      async function clearAllCachesAndReload() {
                        try {
                          console.log('Emergency: Clearing all caches...');
                          if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map(name => caches.delete(name)));
                            console.log('All caches cleared');
                          }
                          if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            await Promise.all(registrations.map(reg => reg.unregister()));
                            console.log('All service workers unregistered');
                          }
                          // Force reload with cache bypass
                          window.location.reload(true);
                        } catch (error) {
                          console.error('Emergency clear failed:', error);
                          // Last resort - redirect to fresh URL
                          window.location.href = '/?emergency=' + Date.now();
                        }
                      }
                    </script>
                  </div>
                  <script>
                    let attempts = 0;
                    const maxAttempts = 3;
                    const retry = () => {
                      attempts++;
                      if (attempts <= maxAttempts) {
                        console.log('Emergency recovery attempt', attempts);
                        setTimeout(() => location.reload(true), 2000);
                      }
                    };
                    retry();
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