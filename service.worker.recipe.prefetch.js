
var CACHE_VERSION = 2;
var CURRENT_CACHES = {
  prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

const createCacheBustedRequest = (url) => {
  let request = new Request(url, { cache: 'reload' });
  if ('cache' in request) {
    return request;
  }

  let bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
  return new Request(bustedUrl);
}

importScripts('./getApi.js');

self.addEventListener('install', event => {
  self.skipWaiting();

  var now = Date.now();

  var urlsToPrefetch = [
    '/',
    '/static/images/Dubai-Photos-Images-Travel-Tourist-Images-Pictures.jpg',
    '/js/app.js',
    '/js/states.json',
    '/manifest.json',
    'https://api.github.com/users/aasifrasul',
    '/web-Worker.js',
  ];

  console.log('Handling install event. Resources to prefetch:', urlsToPrefetch);

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(cache => {
      var cachePromises = urlsToPrefetch.map(urlToPrefetch => {
        var url = new URL(urlToPrefetch, location.href);
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

        var request = new Request(url, { mode: 'no-cors', cache: 'no-cache' });
        return fetch(request).then(response => {
          const { status, statusText } = response || {};
          if (status >= 400) {
            throw new Error(`request for ${urlToPrefetch} failed with status ${statusText}`);
          }

          return cache.put(urlToPrefetch, response);
        }).catch((error) => {
          console.error(`Not caching ${urlToPrefetch} due to ${error}`);
        });
      });

      return Promise.all(cachePromises).then(() => {
        console.log('Pre-fetching complete.');
      });
    }).catch((error) => {
      console.error('Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', event => {
  clients.claim();
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  
  const {
    request,
    request: {
      method,
      url,
    },
  } = event;

  if (method !== 'GET') {
    console.log('WORKER: fetch event ignored.', method, url);
    return;
  }
  console.log('Handling fetch event for', request.url);
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        console.log('Found response in cache:', response);
        return response;
      }
      console.log('No response found in cache. About to fetch from network...');
      const clonedRequest = request.clone();

      return fetch(clonedRequest).then(response => {
        console.log('Response from network is:', response);
        const clonedResponse = response.clone();

        caches.open(CURRENT_CACHES.prefetch)
          .then((cache) => {
            cache.put(request, clonedResponse);
          });

        return response;
      }).catch(error => {
        console.error('Fetching failed:', error);
        throw error;
      });
    })
  );
});
