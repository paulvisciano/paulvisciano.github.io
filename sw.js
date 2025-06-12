const CACHE_NAME = 'whereispaul-v1';
const DYNAMIC_CACHE_NAME = 'whereispaul-dynamic-v1';

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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Network-first strategy for moments.js
  if (url.pathname.includes('moments.js')) {
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