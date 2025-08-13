/**
 * Sistema de monitoreo de performance ultra-avanzado
 * Mide y optimiza automáticamente la carga de imágenes
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      imageLoads: [],
      networkSpeed: 'unknown',
      cacheHits: 0,
      cacheMisses: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      largestContentfulPaint: 0,
      firstImagePaint: 0,
      totalImagesLoaded: 0,
      errors: []
    };
    
    this.thresholds = {
      slowImageLoad: 2000, // 2 segundos (NAVEGACIÓN)
      goodCacheRatio: 0.6, // 60% cache hits (NAVEGACIÓN REALISTA)
      targetLCP: 2500 // 2.5 segundos LCP (NAVEGACIÓN)
    };
    
    this.observers = {
      performance: null,
      intersection: null,
      mutation: null
    };
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    // Monitorear Web Vitals
    this.setupWebVitalsMonitoring();
    
    // Monitorear velocidad de red
    this.setupNetworkMonitoring();
    
    // Configurar observadores
    this.setupPerformanceObserver();
    
    // Reportar métricas periódicamente
    this.setupPeriodicReporting();
  }

  // Configurar monitoreo de Web Vitals
  setupWebVitalsMonitoring() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          
          // Auto-optimizar si LCP es muy lento
          if (lastEntry.startTime > this.thresholds.targetLCP) {
            this.triggerLCPOptimization();
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.performance = lcpObserver;
      } catch (error) {
        console.warn('LCP monitoring not supported:', error);
      }
    }

    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstImagePaint = entry.startTime;
            }
          });
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('FCP monitoring not supported:', error);
      }
    }
  }

  // Configurar monitoreo de red
  setupNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateNetworkSpeed = () => {
        this.metrics.networkSpeed = connection.effectiveType || 'unknown';
        
        // Auto-ajustar estrategias basado en velocidad
        this.adjustStrategiesForNetwork(connection.effectiveType);
      };
      
      updateNetworkSpeed();
      connection.addEventListener('change', updateNetworkSpeed);
    }
  }

  // Configurar Performance Observer para recursos
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach(entry => {
            if (this.isImageResource(entry)) {
              this.recordImageLoad(entry);
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource monitoring not supported:', error);
      }
    }
  }

  // Verificar si el recurso es una imagen
  isImageResource(entry) {
    return entry.initiatorType === 'img' || 
           entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ||
           entry.name.includes('cloudinary.com');
  }

  // Registrar carga de imagen
  recordImageLoad(entry) {
    const loadTime = entry.responseEnd - entry.startTime;
    const cacheHit = entry.transferSize === 0;
    
    const imageMetric = {
      url: entry.name,
      loadTime,
      size: entry.transferSize,
      cacheHit,
      startTime: entry.startTime,
      timestamp: Date.now()
    };
    
    this.metrics.imageLoads.push(imageMetric);
    this.metrics.totalImagesLoaded++;
    this.metrics.totalLoadTime += loadTime;
    
    if (cacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
    
    // Calcular promedio
    this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.totalImagesLoaded;
    
    // Alertar sobre cargas lentas
    if (loadTime > this.thresholds.slowImageLoad) {
      this.reportSlowImage(imageMetric);
    }
    
    // Mantener solo las últimas 100 métricas
    if (this.metrics.imageLoads.length > 100) {
      this.metrics.imageLoads = this.metrics.imageLoads.slice(-100);
    }
  }

  // Registrar carga desde cache personalizado
  recordCacheLoad(url, loadTime, source = 'indexeddb') {
    const imageMetric = {
      url,
      loadTime,
      size: 0,
      cacheHit: true,
      source,
      startTime: performance.now(),
      timestamp: Date.now()
    };
    
    this.metrics.imageLoads.push(imageMetric);
    this.metrics.cacheHits++;
    this.metrics.totalImagesLoaded++;
    this.metrics.totalLoadTime += loadTime;
    this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.totalImagesLoaded;
  }

  // Registrar error de carga
  recordImageError(url, error) {
    this.metrics.errors.push({
      url,
      error: error.message || 'Unknown error',
      timestamp: Date.now()
    });
    
    // Mantener solo los últimos 50 errores
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }
  }

  // Reportar imagen lenta
  reportSlowImage(imageMetric) {
    console.warn('🐌 Imagen cargando lentamente:', {
      url: imageMetric.url,
      loadTime: `${imageMetric.loadTime.toFixed(0)}ms`,
      threshold: `${this.thresholds.slowImageLoad}ms`,
      size: imageMetric.size ? `${(imageMetric.size / 1024).toFixed(1)}KB` : 'cached'
    });
    
    // Sugerir optimizaciones automáticamente
    this.suggestOptimizations(imageMetric);
  }

  // Sugerir optimizaciones
  suggestOptimizations(imageMetric) {
    const suggestions = [];
    
    if (imageMetric.size > 500 * 1024) { // > 500KB
      suggestions.push('Imagen muy grande - considerar compresión adicional');
    }
    
    if (!imageMetric.cacheHit && this.metrics.networkSpeed === 'slow') {
      suggestions.push('Red lenta detectada - aumentar agresividad de cache');
    }
    
    if (imageMetric.url.includes('cloudinary.com') && !imageMetric.url.includes('f_auto')) {
      suggestions.push('URL de Cloudinary sin optimización automática');
    }
    
    if (suggestions.length > 0) {
      console.log('💡 Sugerencias de optimización:', suggestions);
    }
  }

  // Optimizar automáticamente para LCP
  triggerLCPOptimization() {
    console.log('🚀 Activando optimizaciones automáticas para LCP...');
    
    // Enviar evento para aumentar prioridad de precarga
    window.dispatchEvent(new CustomEvent('optimize-lcp', {
      detail: {
        currentLCP: this.metrics.largestContentfulPaint,
        target: this.thresholds.targetLCP
      }
    }));
  }

  // Ajustar estrategias según velocidad de red
  adjustStrategiesForNetwork(effectiveType) {
    const strategies = {
      'slow-2g': {
        preloadLimit: 2,
        quality: 50,
        cacheAggressive: true,
        lazyThreshold: '50px'
      },
      '2g': {
        preloadLimit: 3,
        quality: 60,
        cacheAggressive: true,
        lazyThreshold: '100px'
      },
      '3g': {
        preloadLimit: 5,
        quality: 75,
        cacheAggressive: true,
        lazyThreshold: '200px'
      },
      '4g': {
        preloadLimit: 10,
        quality: 'auto',
        cacheAggressive: false,
        lazyThreshold: '300px'
      }
    };
    
    const strategy = strategies[effectiveType] || strategies['3g'];
    
    // Enviar estrategia optimizada
    window.dispatchEvent(new CustomEvent('network-strategy-update', {
      detail: strategy
    }));
  }

  // Configurar reporte periódico
  setupPeriodicReporting() {
    // Reportar cada 30 segundos si hay actividad
    setInterval(() => {
      if (this.metrics.totalImagesLoaded > 0) {
        this.generateReport();
      }
    }, 30000);
    
    // Reporte completo antes de salir de la página
    window.addEventListener('beforeunload', () => {
      this.generateFinalReport();
    });
  }

  // Generar reporte de métricas
  generateReport() {
    const cacheRatio = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses);
    
    const report = {
      timestamp: new Date().toISOString(),
      totalImages: this.metrics.totalImagesLoaded,
      averageLoadTime: Math.round(this.metrics.averageLoadTime),
      cacheRatio: Math.round(cacheRatio * 100),
      networkSpeed: this.metrics.networkSpeed,
      lcp: Math.round(this.metrics.largestContentfulPaint),
      errors: this.metrics.errors.length,
      performance: this.getPerformanceGrade(cacheRatio)
    };
    
    // Solo log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Reporte de Performance de Imágenes:', report);
    }
    
    return report;
  }

  // Calcular calificación de performance (OPTIMIZADO PARA NAVEGACIÓN)
  getPerformanceGrade(cacheRatio) {
    let score = 0;
    
    // Cache ratio (35% del score) - REDUCIDO para ser menos estricto
    if (cacheRatio >= this.thresholds.goodCacheRatio) score += 35;
    else score += (cacheRatio / this.thresholds.goodCacheRatio) * 35;
    
    // Average load time (35% del score) - AUMENTADO porque es más importante
    if (this.metrics.averageLoadTime <= 1000) score += 35;
    else if (this.metrics.averageLoadTime <= 2000) score += 30;
    else if (this.metrics.averageLoadTime <= 3000) score += 25;
    else if (this.metrics.averageLoadTime <= 4000) score += 15; // MÁS TOLERANTE
    
    // LCP (20% del score) - MANTENER
    if (this.metrics.largestContentfulPaint <= this.thresholds.targetLCP) score += 20;
    else score += Math.max(0, 20 - ((this.metrics.largestContentfulPaint - this.thresholds.targetLCP) / 1000) * 3); // MÁS TOLERANTE
    
    // Error rate (10% del score) - MANTENER
    const errorRate = this.metrics.errors.length / this.metrics.totalImagesLoaded;
    if (errorRate === 0) score += 10;
    else score += Math.max(0, 10 - (errorRate * 50)); // MÁS TOLERANTE
    
    // THRESHOLDS MÁS GENEROSOS para navegación
    if (score >= 80) return { grade: 'A', score: Math.round(score) }; // ERA 85
    if (score >= 65) return { grade: 'B', score: Math.round(score) }; // ERA 70
    if (score >= 50) return { grade: 'C', score: Math.round(score) }; // ERA 55
    if (score >= 35) return { grade: 'D', score: Math.round(score) }; // ERA 40
    return { grade: 'F', score: Math.round(score) };
  }

  // Generar reporte final
  generateFinalReport() {
    const finalReport = this.generateReport();
    finalReport.sessionDuration = Date.now() - (this.sessionStart || Date.now());
    
    // Guardar en localStorage para análisis posterior
    try {
      const reports = JSON.parse(localStorage.getItem('imagePerformanceReports') || '[]');
      reports.push(finalReport);
      
      // Mantener solo los últimos 10 reportes
      const recentReports = reports.slice(-10);
      localStorage.setItem('imagePerformanceReports', JSON.stringify(recentReports));
    } catch (error) {
      console.warn('No se pudo guardar reporte final:', error);
    }
  }

  // Obtener métricas actuales
  getCurrentMetrics() {
    return {
      ...this.metrics,
      cacheRatio: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0,
      performance: this.getPerformanceGrade(this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0)
    };
  }

  // Limpiar métricas
  reset() {
    this.metrics = {
      imageLoads: [],
      networkSpeed: 'unknown',
      cacheHits: 0,
      cacheMisses: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      largestContentfulPaint: 0,
      firstImagePaint: 0,
      totalImagesLoaded: 0,
      errors: []
    };
  }

  // Destruir observadores
  destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect();
      }
    });
  }
}

// Instancia singleton
const performanceMonitor = new PerformanceMonitor();

// Funciones de utilidad para componentes
export const usePerformanceTracking = () => {
  return {
    recordImageLoad: (url, loadTime, cached = false) => {
      if (cached) {
        performanceMonitor.recordCacheLoad(url, loadTime);
      }
    },
    recordImageError: (url, error) => {
      performanceMonitor.recordImageError(url, error);
    },
    getCurrentMetrics: () => performanceMonitor.getCurrentMetrics(),
    getReport: () => performanceMonitor.generateReport()
  };
};

export default performanceMonitor;
