// Versión del cache - cambia este valor para actualizar el cache
const CACHE_NAME = 'tu-app-cache-v1';
const OFFLINE_URL = '/offline.html'; // Página offline personalizada (opcional)

// Archivos esenciales para cachear (ajusta según tus necesidades)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/css/main.chunk.css',
  // Agrega aquí otras rutas importantes de tu app
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza al SW a activarse inmediatamente
  );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', (event) => {
  // Ignora solicitudes que no sean GET o que sean a APIs externas
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension') || 
      !(event.request.url.indexOf('http') === 0)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Primero intenta devolver del cache
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en cache, hace la petición a la red
        return fetch(event.request)
          .then((response) => {
            // Verifica que la respuesta sea válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la respuesta para guardarla en cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Si falla la red y no tenemos la página en cache
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Toma control de todos los clients
  );
});