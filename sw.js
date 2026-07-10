var CACHE_NAME = 'mahjong-tour-v6';
var urlsToCache = [
    './',
    'index.html',
    'juego.js',
    'datos.js',
    'misiones.js',
    'logros.js',
    'ui.js',
    'manifest.json',
    'icon-192.png',
    'icon-512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Network-first: siempre intenta traer la version mas reciente.
// Si no hay conexion, usa la copia guardada en cache como respaldo.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(response) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
            });
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});
