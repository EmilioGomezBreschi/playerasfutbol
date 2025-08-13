/**
 * Sistema de cache avanzado para imágenes con IndexedDB
 * Almacena imágenes localmente para carga instantánea
 */

class AdvancedImageCache {
  constructor() {
    this.dbName = 'CamisasImageCache';
    this.version = 2;
    this.storeName = 'images';
    this.metaStoreName = 'metadata';
    this.db = null;
    this.maxCacheSize = 40 * 1024 * 1024; // 40MB máximo (NAVEGACIÓN)
    this.maxAge = 5 * 24 * 60 * 60 * 1000; // 5 días (BALANCEADO)
    this.maxEntries = 15; // MÁXIMO 15 imágenes (NAVEGACIÓN ÓPTIMA)
    this.compressionQuality = 0.6; // Más agresivo
    this.init();
  }

  async init() {
    try {
      this.db = await this.openDB();
      
      // LIMPIEZA INTELIGENTE para navegación multi-página
      const stats = await this.getCacheStats();
      if (stats.entries > 15) {
        console.log('🧹 LIMPIEZA INTELIGENTE: Optimizando cache con', stats.entries, 'imágenes');
        await this.enforceImageCacheLimit(); // LIMPIAR EXCESO, NO TODO
      }
      
      this.cleanOldEntries();
    } catch (error) {
      console.warn('IndexedDB no disponible, usando memoria:', error);
      this.fallbackToMemory();
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store principal para imágenes
        if (!db.objectStoreNames.contains(this.storeName)) {
          const imageStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
          imageStore.createIndex('timestamp', 'timestamp');
          imageStore.createIndex('size', 'size');
        }
        
        // Store para metadata
        if (!db.objectStoreNames.contains(this.metaStoreName)) {
          const metaStore = db.createObjectStore(this.metaStoreName, { keyPath: 'key' });
        }
      };
    });
  }

  // Cache imagen con compresión inteligente
  async cacheImage(url, priority = 'medium') {
    if (!this.db) return null;

    try {
      // Verificar si ya está en cache
      const existing = await this.getFromCache(url);
      if (existing) return existing;

      // Descargar imagen
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      
      // DESACTIVAR COMPRESIÓN ROTA - Usar blob original
      console.log('📦 Cache directo sin compresión:', { url, size: blob.size });
      const compressedBlob = blob; // NO COMPRIMIR POR AHORA
      
      // Almacenar en IndexedDB
      const imageData = {
        url,
        blob: compressedBlob,
        originalSize: blob.size,
        compressedSize: compressedBlob.size,
        timestamp: Date.now(),
        priority,
        mimeType: blob.type
      };

      await this.storeInDB(imageData);
      
      // Verificar límites de cache
      this.enforceCacheLimit();
      
      return URL.createObjectURL(compressedBlob);
      
    } catch (error) {
      console.warn('Error caching image:', url, error);
      return null;
    }
  }

  // Comprimir imagen manteniendo calidad visual (CORREGIDO)
  async compressImage(blob, priority) {
    if (!blob.type.startsWith('image/') || blob.type === 'image/svg+xml') {
      console.log('🚫 No comprimiendo SVG:', blob.type);
      return blob; // No comprimir SVG
    }

    // VERIFICAR que necesita compresión
    if (blob.size < 50000) { // < 50KB no necesita compresión
      console.log('✅ Imagen pequeña, no necesita compresión:', blob.size);
      return blob;
    }

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calcular tamaño óptimo basado en prioridad (CORREGIDO)
          let maxWidth, maxHeight, quality;
          
          console.log('🖼️ Comprimiendo imagen:', {
            original: { width: img.width, height: img.height, size: blob.size },
            priority
          });
          
          switch (priority) {
            case 'high':
              maxWidth = 800;
              maxHeight = 600;
              quality = 0.8; // Balanceado
              break;
            case 'medium':
              maxWidth = 600;
              maxHeight = 450;
              quality = 0.7; // Moderado
              break;
            case 'low':
              maxWidth = 400;
              maxHeight = 300;
              quality = 0.6; // Agresivo pero no excesivo
              break;
            default:
              maxWidth = 600;
              maxHeight = 450;
              quality = 0.7; // Moderado por defecto
          }

          // Calcular dimensiones manteniendo aspect ratio
          let { width, height } = this.calculateDimensions(
            img.width, img.height, maxWidth, maxHeight
          );

          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a blob comprimido
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.onerror = () => resolve(blob); // Fallback al original
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      return blob; // Fallback al original
    }
  }

  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  // Obtener imagen del cache
  async getFromCache(url) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Verificar si no ha expirado
            if (Date.now() - result.timestamp < this.maxAge) {
              resolve(URL.createObjectURL(result.blob));
            } else {
              // Eliminar entrada expirada
              this.removeFromCache(url);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Error getting from cache:', error);
      return null;
    }
  }

  // Almacenar en IndexedDB
  async storeInDB(imageData) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(imageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Eliminar del cache
  async removeFromCache(url) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(url);
    } catch (error) {
      console.warn('Error removing from cache:', error);
    }
  }

  // Limpiar entradas antiguas
  async cleanOldEntries() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const cutoff = Date.now() - this.maxAge;
      
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Error cleaning old entries:', error);
    }
  }

  // Hacer cumplir límites de cache
  async enforceCacheLimit() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        const totalSize = entries.reduce((sum, entry) => sum + entry.compressedSize, 0);
        
        if (totalSize > this.maxCacheSize) {
          // Ordenar por timestamp (más antiguos primero)
          entries.sort((a, b) => a.timestamp - b.timestamp);
          
          // Eliminar hasta estar bajo el límite
          let currentSize = totalSize;
          let i = 0;
          
          while (currentSize > this.maxCacheSize * 0.8 && i < entries.length) {
            this.removeFromCache(entries[i].url);
            currentSize -= entries[i].compressedSize;
            i++;
          }
        }
      };
    } catch (error) {
      console.warn('Error enforcing cache limit:', error);
    }
  }

  // Precargar múltiples imágenes
  async preloadImages(urls, priority = 'medium') {
    const promises = urls.map(url => this.cacheImage(url, priority));
    return Promise.allSettled(promises);
  }

  // Obtener estadísticas del cache
  async getCacheStats() {
    if (!this.db) return { entries: 0, totalSize: 0 };

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entries = request.result;
          const totalSize = entries.reduce((sum, entry) => sum + entry.compressedSize, 0);
          const totalOriginalSize = entries.reduce((sum, entry) => sum + entry.originalSize, 0);
          
          resolve({
            entries: entries.length,
            totalSize,
            totalOriginalSize,
            compressionRatio: totalOriginalSize > 0 ? totalSize / totalOriginalSize : 1,
            maxAge: this.maxAge,
            maxSize: this.maxCacheSize
          });
        };
        request.onerror = () => resolve({ entries: 0, totalSize: 0 });
      });
    } catch (error) {
      return { entries: 0, totalSize: 0 };
    }
  }

  // Limpiar todo el cache
  async clearCache() {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.clear();
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  // Fallback a memoria si IndexedDB falla
  fallbackToMemory() {
    this.memoryCache = new Map();
    this.maxMemoryEntries = 50;

    this.getFromCache = async (url) => {
      return this.memoryCache.get(url) || null;
    };

    this.cacheImage = async (url, priority) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        if (this.memoryCache.size >= this.maxMemoryEntries) {
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        
        this.memoryCache.set(url, objectUrl);
        return objectUrl;
      } catch (error) {
        return null;
      }
    };
  }
}

// Instancia singleton
const advancedImageCache = new AdvancedImageCache();

export default advancedImageCache;
