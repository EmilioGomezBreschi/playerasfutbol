// Service Worker corregido para cache offline de imágenes
const CACHE_NAME = 'camisas-cache-v2';
const IMAGE_CACHE_NAME = 'camisas-images-v2';

// Archivos críticos para cache inmediato
const CRITICAL_FILES = [
  '/',
  '/retro',
  '/jugador',
  '/aficionado',
  '/retro.jpeg',
  '/jugador.jpeg',
  '/aficionado.jpeg',
  '/images/heart.svg',
  '/images/star.svg',
  '/images/shirtorange.svg'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Instalando Service Worker v2...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Precargando archivos críticos...');
        return cache.addAll(CRITICAL_FILES.map(url => new Request(url, {
          cache: 'reload' // Forzar recarga para evitar problemas de cache
        })));
      })
      .then(() => {
        console.log('✅ Service Worker instalado correctamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Activando Service Worker v2...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado y controlando todas las páginas');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia para imágenes
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Estrategia para CSS y JS
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleAssetRequest(request));
    return;
  }

  // Estrategia para páginas HTML
  if (request.mode === 'navigate') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Para todo lo demás, usar network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Manejo de imágenes: Cache-first con network fallback
async function handleImageRequest(request) {
  try {
    // Buscar en cache primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no está en cache, intentar red
    const networkResponse = await fetch(request);
    
    // Si la respuesta es exitosa, guardar en cache
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      // IMPORTANTE: Crear una copia para el cache
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
    
  } catch (error) {
    // Si falla todo, devolver imagen placeholder
    console.log('🖼️ Usando placeholder para:', request.url);
    
    const placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
          Imagen no disponible
        </text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
          Sin conexión
        </text>
      </svg>
    `;
    
    return new Response(placeholderSvg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// Manejo de assets (CSS/JS): Cache-first
async function handleAssetRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
    
  } catch (error) {
    // Fallback: buscar en cualquier cache
    return caches.match(request);
  }
}

// Manejo de páginas: Network-first con cache fallback
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
    
  } catch (error) {
    // Si falla la red, buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Última opción: página offline básica
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Sin conexión</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>🌐 Sin conexión</h1>
          <p>No hay conexión a internet. Intenta recargar cuando tengas conexión.</p>
          <button onclick="location.reload()">🔄 Intentar de nuevo</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    // Limpiar caches periódicamente
    cleanOldCaches();
  }
});

// Función para limpiar caches antiguos
async function cleanOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name.includes('camisas') && name !== CACHE_NAME && name !== IMAGE_CACHE_NAME
    );
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log('🧹 Caches antiguos limpiados:', oldCaches);
  } catch (error) {
    console.error('Error limpiando caches:', error);
  }
}
