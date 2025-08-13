/**
 * Optimizador ultra-agresivo específico para dispositivos móviles
 * Resuelve el problema de carga lenta en teléfonos
 */

class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.connectionType = this.detectConnection();
    this.deviceSpecs = this.getDeviceSpecs();
    
    // Configuración ultra-agresiva para móvil
    this.mobileConfig = {
      maxImageWidth: this.isMobile ? 400 : 800,
      quality: this.getOptimalQuality(),
      preloadLimit: this.isMobile ? 1 : 3,
      cacheLimit: this.isMobile ? 5 : 15,
      lazyThreshold: this.isMobile ? '50px' : '200px',
      timeout: this.isMobile ? 8000 : 3000
    };

    console.log('📱 MOBILE OPTIMIZER:', {
      isMobile: this.isMobile,
      connection: this.connectionType,
      config: this.mobileConfig
    });
  }

  detectMobile() {
    if (typeof window === 'undefined') return false;
    
    // Detección ultra-precisa de móvil
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'windows phone', 'mobile', 'opera mini'
    ];
    
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isMobileScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window;
    
    return isMobileUA || isMobileScreen || isTouchDevice;
  }

  detectConnection() {
    if (typeof navigator === 'undefined' || !navigator.connection) {
      return 'unknown';
    }
    
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  getDeviceSpecs() {
    if (typeof window === 'undefined') return {};
    
    return {
      devicePixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      memory: navigator.deviceMemory || 'unknown'
    };
  }

  getOptimalQuality() {
    if (!this.isMobile) return 'auto';
    
    // Calidad ultra-agresiva para móvil según conexión
    if (this.connectionType.effectiveType === 'slow-2g') return 30;
    if (this.connectionType.effectiveType === '2g') return 40;
    if (this.connectionType.effectiveType === '3g') return 50;
    if (this.connectionType.effectiveType === '4g') return 60;
    
    // Fallback basado en saveData
    if (this.connectionType.saveData) return 35;
    
    return 50; // Default móvil
  }

  optimizeCloudinaryUrl(url, customOptions = {}) {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    try {
      // Configuración ultra-agresiva para móvil
      const options = {
        width: this.mobileConfig.maxImageWidth,
        quality: customOptions.quality || this.mobileConfig.quality,
        format: 'auto',
        crop: 'scale',
        fetch_format: 'auto',
        flags: 'progressive',
        dpr: Math.min(this.deviceSpecs.devicePixelRatio || 1, 2), // Max 2x
        ...customOptions
      };

      // Transformaciones para móvil
      const transformations = [];
      
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.quality) transformations.push(`q_${options.quality}`);
      if (options.format) transformations.push(`f_${options.format}`);
      if (options.crop) transformations.push(`c_${options.crop}`);
      if (options.dpr) transformations.push(`dpr_${options.dpr}`);
      if (options.flags) transformations.push(`fl_${options.flags}`);

      // Aplicar transformaciones
      const baseUrl = url.split('/upload/')[0];
      const imagePath = url.split('/upload/')[1];
      
      if (!baseUrl || !imagePath) return url;
      
      const optimizedUrl = `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`;
      
      console.log('📱 URL Móvil optimizada:', {
        original: url.substring(0, 50) + '...',
        optimized: optimizedUrl.substring(0, 50) + '...',
        savings: `${Math.round((1 - optimizedUrl.length / url.length) * 100)}%`
      });
      
      return optimizedUrl;
      
    } catch (error) {
      console.warn('Error optimizando URL para móvil:', error);
      return url;
    }
  }

  // Precargar solo críticas en móvil
  getMobilePreloadUrls(allUrls) {
    if (!this.isMobile) return allUrls.slice(0, 3);
    
    // En móvil, solo precargar la primera imagen
    return allUrls.slice(0, 1);
  }

  // Cache ultra-limitado para móvil
  getMobileCacheConfig() {
    if (!this.isMobile) return {};
    
    return {
      maxEntries: 3, // Solo 3 imágenes
      maxSize: 10 * 1024 * 1024, // 10MB máximo
      maxAge: 1 * 24 * 60 * 60 * 1000 // 1 día
    };
  }

  // Timeout agresivo para móvil
  getMobileTimeout() {
    if (!this.isMobile) return 3000;
    
    if (this.connectionType.effectiveType === 'slow-2g') return 15000;
    if (this.connectionType.effectiveType === '2g') return 12000;
    if (this.connectionType.effectiveType === '3g') return 10000;
    
    return 8000; // Default móvil
  }

  // Lazy loading ultra-agresivo
  getMobileLazyConfig() {
    if (!this.isMobile) return { rootMargin: '200px 0px' };
    
    return {
      rootMargin: '50px 0px', // Muy cerca para móvil
      threshold: 0.1
    };
  }

  // Configuración de red para móvil
  shouldUseDataSaver() {
    return this.isMobile && (
      this.connectionType.saveData ||
      this.connectionType.effectiveType === 'slow-2g' ||
      this.connectionType.effectiveType === '2g'
    );
  }

  // Sizes responsive para móvil
  getMobileSizes() {
    if (!this.isMobile) {
      return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";
    }
    
    return "100vw"; // Móvil siempre 100% del viewport
  }

  // Log de performance móvil
  logMobilePerformance(loadTime, imageUrl) {
    if (!this.isMobile) return;
    
    const performance = {
      loadTime,
      url: imageUrl.substring(0, 50),
      connection: this.connectionType.effectiveType,
      optimal: loadTime < 3000
    };
    
    if (loadTime > 5000) {
      console.warn('📱 ⚠️ Carga lenta en móvil:', performance);
    } else {
      console.log('📱 ✅ Carga óptima móvil:', performance);
    }
  }
}

// Instancia singleton
const mobileOptimizer = new MobileOptimizer();

export default mobileOptimizer;
