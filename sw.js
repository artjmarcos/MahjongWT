var CACHE_NAME = 'mahjong-tour-v39';
var urlsToCache = [
    './',
    'index.html',
    'juego.js',
    'datos.js',
    'i18n.js',
    'ads-config.js',
    'map-data.js',
    'map-intro.js',
    'misiones.js',
    'logros.js',
    'musica.js',
    'ui.js',
    'manifest.json',
    'plane.png',
    'icon-192.png',
    'icon-512.png',
    'icon-base.png',
    'icon-192-square.png',
    'icon-512-square.png',
    'icon-192-maskable.png',
    'icon-512-maskable.png',
    'apple-touch-icon.png',
    'favicon-32.png',
    'privacy-policy.html',
    'ads.txt',
    'robots.txt',
    'sitemap.xml',
    'Cumbres_bajo_el_Sol.mp3',
    'Cortes_de_Medianoche.mp3',
    'La_Senda_del_Honor.mp3',
    'Shadows_in_the_Palms.mp3'
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
