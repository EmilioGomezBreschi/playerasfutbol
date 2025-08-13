/**
 * Sistema de limpieza de emergencia para cuando el cache se sobrecarga
 */

class EmergencyCleanup {
  constructor() {
    this.isRunning = false;
  }

  async performEmergencyCleanup() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🚨 INICIANDO LIMPIEZA DE EMERGENCIA...');

    try {
      // 1. Limpiar IndexedDB
      await this.cleanIndexedDB();
      
      // 2. Limpiar Service Worker caches
      await this.cleanServiceWorkerCaches();
      
      // 3. Limpiar memoria
      this.cleanMemory();
      
      // 4. Resetear performance monitor
      this.resetPerformanceMonitor();

      console.log('✅ LIMPIEZA DE EMERGENCIA COMPLETADA');
      
      // Recargar página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error en limpieza de emergencia:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async cleanIndexedDB() {
    try {
      const dbNames = ['CamisasImageCache'];
      
      for (const dbName of dbNames) {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          deleteReq.onsuccess = () => {
            console.log(`🗑️ IndexedDB eliminado: ${dbName}`);
            resolve();
          };
          deleteReq.onerror = () => reject(deleteReq.error);
        });
      }
    } catch (error) {
      console.warn('Error limpiando IndexedDB:', error);
    }
  }

  async cleanServiceWorkerCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(async (cacheName) => {
            await caches.delete(cacheName);
            console.log(`🗑️ Cache eliminado: ${cacheName}`);
          })
        );
      } catch (error) {
        console.warn('Error limpiando Service Worker caches:', error);
      }
    }
  }

  cleanMemory() {
    try {
      // Limpiar localStorage
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('image') || key.includes('cache') || key.includes('performance'))) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ LocalStorage eliminado: ${key}`);
      });

      // Forzar garbage collection si está disponible
      if (window.gc) {
        window.gc();
        console.log('🗑️ Garbage collection ejecutado');
      }
      
    } catch (error) {
      console.warn('Error limpiando memoria:', error);
    }
  }

  resetPerformanceMonitor() {
    try {
      // Enviar evento para resetear performance monitor
      window.dispatchEvent(new CustomEvent('reset-performance-monitor'));
      console.log('📊 Performance Monitor reseteado');
    } catch (error) {
      console.warn('Error reseteando performance monitor:', error);
    }
  }

  // Función de emergencia para llamar desde consola
  static emergency() {
    const cleanup = new EmergencyCleanup();
    cleanup.performEmergencyCleanup();
  }
}

// Hacer disponible globalmente para emergencias
if (typeof window !== 'undefined') {
  window.emergencyCleanup = EmergencyCleanup.emergency;
}

export default EmergencyCleanup;
