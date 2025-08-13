// Service Worker de limpieza - Desactiva automáticamente el SW anterior
self.addEventListener('install', () => {
  console.log('🧹 Service Worker de limpieza activado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🗑️ Limpiando Service Worker anterior...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar todos los caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Desregistrar este mismo service worker
      self.registration.unregister().then(() => {
        console.log('✅ Service Worker completamente eliminado');
        // Recargar todas las pestañas para limpiar completamente
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            if (client.url && client.navigate) {
              client.navigate(client.url);
            }
          });
        });
      })
    ])
  );
});

// No manejar ningún fetch - solo limpiar
self.addEventListener('fetch', (event) => {
  // Pasar todos los requests sin interceptar
  return;
});