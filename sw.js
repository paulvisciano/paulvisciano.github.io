const CACHE_NAME = 'whereispaul-v1';
const urlsToCache = [
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
  '/components/app.js',
  '/moments/moments.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
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