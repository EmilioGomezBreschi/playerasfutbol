// Service Worker Ultra-Optimizado para máximo rendimiento
const CACHE_VERSION = 'v3-ultra';
const CACHE_NAME = `camisas-ultra-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `camisas-images-ultra-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `camisas-static-ultra-${CACHE_VERSION}`;

// Configuración avanzada
const CONFIG = {
  maxImageCacheSize: 150, // Máximo 150 imágenes en cache
  maxImageAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  maxStaticAge: 30 * 24 * 60 * 60 * 1000, // 30 días
  networkTimeoutMs: 3000, // 3 segundos timeout
  preloadLimit: 10, // Máximo 10 precargas simultáneas
  compressionQuality: 0.8
};

// URLs críticas para cache inmediato
const CRITICAL_RESOURCES = [
  '/',
  '/retro',
  '/jugador', 
  '/aficionado',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/retro.jpeg',
  '/jugador.jpeg',
  '/aficionado.jpeg'
];

// Instalación ultra-rápida
self.addEventListener('install', (event) => {
  console.log('🚀 Instalando Service Worker Ultra-Optimizado...');
  
  event.waitUntil(
    Promise.all([
      // Cache crítico
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url => !url.includes('_next')));
      }),
      // Activar inmediatamente
      self.skipWaiting()
    ])
  );
});

// Activación con limpieza inteligente
self.addEventListener('activate', (event) => {
  console.log('⚡ Activando Service Worker Ultra-Optimizado...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      cleanOldCaches(),
      // Tomar control inmediato
      self.clients.claim(),
      // Configurar estrategias de cache
      setupCacheStrategies()
    ])
  );
});

// Manejo ultra-optimizado de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo interceptar HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Estrategias por tipo de recurso
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Detectar tipos de request
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ||
         request.url.includes('cloudinary.com');
}

function isStaticAsset(request) {
  return request.url.includes('/_next/static/') ||
         request.url.match(/\.(css|js|woff2?|ttf|eot)$/i);
}

function isAPIRequest(request) {
  return request.url.includes('/api/');
}

function isPageRequest(request) {
  return request.mode === 'navigate';
}

// Manejo ultra-optimizado de imágenes
async function handleImageRequest(request) {
  const cacheKey = getCacheKey(request);
  
  try {
    // 1. Cache-first con validación de edad
    const cachedResponse = await getCachedImage(cacheKey);
    if (cachedResponse) {
      // Precargar versión fresca en background si es necesario
      updateImageInBackground(request);
      return cachedResponse;
    }

    // 2. Network con timeout optimizado
    const networkResponse = await fetchWithTimeout(request, CONFIG.networkTimeoutMs);
    
    if (networkResponse && networkResponse.ok) {
      // Cache agresivo para imágenes exitosas
      cacheImageResponse(cacheKey, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');

  } catch (error) {
    // 3. Fallback a placeholder optimizado
    return createOptimizedPlaceholder(request);
  }
}

// Manejo de assets estáticos
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request, {
      cacheName: STATIC_CACHE_NAME
    });
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetchWithTimeout(request, CONFIG.networkTimeoutMs);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;

  } catch (error) {
    // Intentar desde cualquier cache como último recurso
    return caches.match(request);
  }
}

// Manejo de requests de API
async function handleAPIRequest(request) {
  try {
    // Network-first para APIs con cache corto
    const networkResponse = await fetchWithTimeout(request, CONFIG.networkTimeoutMs);
    
    if (networkResponse && networkResponse.ok) {
      // Cache muy corto para APIs (5 minutos)
      const cache = await caches.open(CACHE_NAME);
      const clonedResponse = networkResponse.clone();
      
      // Añadir timestamp para expiración
      setTimeout(() => {
        cache.delete(request);
      }, 5 * 60 * 1000);
      
      cache.put(request, clonedResponse);
    }
    
    return networkResponse;

  } catch (error) {
    // Fallback a cache si existe
    return caches.match(request);
  }
}

// Manejo de páginas
async function handlePageRequest(request) {
  try {
    // Network-first para páginas
    const networkResponse = await fetchWithTimeout(request, CONFIG.networkTimeoutMs);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;

  } catch (error) {
    // Fallback a cache o página offline
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflinePage();
  }
}

// Obtener imagen del cache con validación
async function getCachedImage(cacheKey) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const response = await cache.match(cacheKey);
  
  if (!response) return null;
  
  // Verificar edad de la imagen
  const cachedDate = response.headers.get('sw-cached-date');
  if (cachedDate) {
    const age = Date.now() - parseInt(cachedDate);
    if (age > CONFIG.maxImageAge) {
      cache.delete(cacheKey);
      return null;
    }
  }
  
  return response;
}

// Cache de respuesta de imagen con metadata
async function cacheImageResponse(cacheKey, response) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    
    // Añadir timestamp a headers
    const headers = new Headers(response.headers);
    headers.set('sw-cached-date', Date.now().toString());
    
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    
    await cache.put(cacheKey, modifiedResponse);
    
    // Limpiar cache si excede límites
    enforceImageCacheLimit();
    
  } catch (error) {
    console.warn('Error caching image:', error);
  }
}

// Fetch con timeout
async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Crear placeholder optimizado
function createOptimizedPlaceholder(request) {
  const url = new URL(request.url);
  const isCloudinary = url.hostname.includes('cloudinary.com');
  
  let placeholderSvg;
  
  if (isCloudinary) {
    // Placeholder específico para Cloudinary
    placeholderSvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial" font-size="18" fill="#999">
          🖼️ Imagen de Camisa
        </text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
          Cargando desde cache...
        </text>
      </svg>
    `;
  } else {
    // Placeholder genérico
    placeholderSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">
          📷 Imagen no disponible
        </text>
      </svg>
    `;
  }
  
  return new Response(placeholderSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

// Crear página offline
function createOfflinePage() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin conexión - Camisas Retro</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; margin: 0; background: #f5f5f5;
            text-align: center; color: #333;
          }
          .container { max-width: 400px; padding: 2rem; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { margin-bottom: 1rem; color: #555; }
          button { 
            background: #007cba; color: white; border: none;
            padding: 0.75rem 1.5rem; border-radius: 0.5rem;
            cursor: pointer; font-size: 1rem; margin-top: 1rem;
          }
          button:hover { background: #005a87; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🌐</div>
          <h1>Sin conexión a internet</h1>
          <p>Verifica tu conexión e intenta nuevamente.</p>
          <button onclick="location.reload()">🔄 Reintentar</button>
          <p><small>Algunas imágenes pueden estar disponibles desde el cache</small></p>
        </div>
      </body>
    </html>
  `;
  
  return new Response(offlineHtml, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Actualizar imagen en background
async function updateImageInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cacheImageResponse(getCacheKey(request), response);
    }
  } catch (error) {
    // Silencioso - solo actualización en background
  }
}

// Generar clave de cache consistente
function getCacheKey(request) {
  return request.url;
}

// Limpiar caches antiguos
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.includes('camisas') && !name.includes(CACHE_VERSION)
  );
  
  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// Hacer cumplir límites de cache de imágenes
async function enforceImageCacheLimit() {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const requests = await cache.keys();
    
    if (requests.length > CONFIG.maxImageCacheSize) {
      // Eliminar las más antiguas
      const toDelete = requests.slice(0, requests.length - CONFIG.maxImageCacheSize);
      await Promise.all(toDelete.map(request => cache.delete(request)));
    }
  } catch (error) {
    console.warn('Error enforcing cache limit:', error);
  }
}

// Configurar estrategias de cache
async function setupCacheStrategies() {
  // Configuración inicial aquí si es necesario
  console.log('⚙️ Estrategias de cache configuradas');
}

// Escuchar mensajes
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0]?.postMessage(stats);
    });
  }
  
  if (event.data?.type === 'CLEAN_CACHES') {
    cleanOldCaches().then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
});

// Obtener estadísticas de cache
async function getCacheStats() {
  try {
    const [imageCache, staticCache, mainCache] = await Promise.all([
      caches.open(IMAGE_CACHE_NAME),
      caches.open(STATIC_CACHE_NAME),
      caches.open(CACHE_NAME)
    ]);
    
    const [imageKeys, staticKeys, mainKeys] = await Promise.all([
      imageCache.keys(),
      staticCache.keys(),
      mainCache.keys()
    ]);
    
    return {
      images: imageKeys.length,
      static: staticKeys.length,
      pages: mainKeys.length,
      version: CACHE_VERSION,
      maxImages: CONFIG.maxImageCacheSize
    };
  } catch (error) {
    return { error: error.message };
  }
}
