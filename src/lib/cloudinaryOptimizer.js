/**
 * Servicio para optimizar URLs de Cloudinary automáticamente
 * NO consume tokens adicionales, solo optimiza las URLs existentes
 */

class CloudinaryOptimizer {
  constructor() {
    this.defaultOptions = {
      width: 600, // Reducido para carga más rápida
      quality: 'auto:low', // MÁS AGRESIVO
      format: 'auto',
      crop: 'scale',
      gravity: 'auto',
      fetch_format: 'auto', // Agregar fetch_format
      flags: 'progressive' // Carga progresiva
    };
  }

  /**
   * Optimiza una URL de Cloudinary con transformaciones automáticas
   * @param {string} url - URL original de Cloudinary
   * @param {object} options - Opciones de optimización
   * @returns {string} - URL optimizada
   */
  optimizeUrl(url, options = {}) {
    if (!this.isCloudinaryUrl(url)) {
      return url;
    }

    // Aplicar optimizaciones inteligentes sin tokens extras
    const config = { ...this.defaultOptions, ...options };
    
    // Generar transformaciones optimizadas
    const transformations = this.generateSmartTransformations(config, url);
    
    // Solo aplicar si las transformaciones son seguras
    if (transformations.length > 0) {
      const optimized = this.applyTransformations(url, transformations);
      if (process.env.NODE_ENV === 'development') {
        console.log('⚡ Cloudinary optimizado:', { original: url, optimized });
      }
      return optimized;
    }
    
    return url;
  }

  /**
   * Verifica si la URL es de Cloudinary
   */
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com') && url.includes('/upload/');
  }

  /**
   * Genera transformaciones inteligentes que no consumen tokens extras
   */
  generateSmartTransformations(config, url) {
    const transformations = [];
    
    // Solo aplicar si la URL no tiene versionado (v1234567890)
    if (url.includes('/v') && url.match(/\/v\d{10}/)) {
      // URL ya tiene versionado, aplicar solo optimizaciones básicas
      transformations.push('f_auto'); // Formato automático (GRATIS)
      transformations.push('q_auto:eco'); // Calidad económica (GRATIS)
      return transformations;
    }
    
    // Para URLs sin versionado, aplicar optimizaciones completas
    return this.generateTransformations(config);
  }

  /**
   * Genera las transformaciones de Cloudinary (método original)
   */
  generateTransformations(config) {
    const transformations = [];

    // Formato automático (WebP/AVIF si está disponible)
    if (config.format === 'auto') {
      transformations.push('f_auto');
    } else if (config.format) {
      transformations.push(`f_${config.format}`);
    }

    // Calidad automática inteligente
    if (config.quality === 'auto') {
      transformations.push('q_auto');
    } else if (config.quality) {
      transformations.push(`q_${config.quality}`);
    }

    // Ancho máximo
    if (config.width) {
      transformations.push(`w_${config.width}`);
    }

    // Altura máxima (si se especifica)
    if (config.height) {
      transformations.push(`h_${config.height}`);
    }

    // Crop automático
    if (config.crop) {
      transformations.push(`c_${config.crop}`);
    }

    // Gravedad automática
    if (config.gravity === 'auto') {
      transformations.push('g_auto');
    } else if (config.gravity) {
      transformations.push(`g_${config.gravity}`);
    }

    return transformations;
  }

  /**
   * Aplica las transformaciones a la URL de Cloudinary
   */
  applyTransformations(url, transformations) {
    if (transformations.length === 0) {
      return url;
    }

    // Dividir la URL en partes
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return url;
    }

    const baseUrl = parts[0];
    const imagePath = parts[1];
    
    // Si la URL ya tiene "v" seguido de números (versionado), no optimizar
    // Estas URLs ya están funcionando y no necesitan más optimización
    if (imagePath.includes('/v') || imagePath.match(/^v\d+/)) {
      return url;
    }
    
    // Construir la URL optimizada
    const transformationsString = transformations.join(',');
    return `${baseUrl}/upload/${transformationsString}/${imagePath}`;
  }

  /**
   * Genera múltiples tamaños para responsive images
   * @param {string} url - URL original
   * @param {array} widths - Array de anchos
   * @returns {object} - Objeto con srcSet y sizes
   */
  generateResponsiveImages(url, widths = [400, 600, 800, 1200]) {
    if (!this.isCloudinaryUrl(url)) {
      return { srcSet: url, sizes: '100vw' };
    }

    const srcSet = widths.map(width => {
      const optimizedUrl = this.optimizeUrl(url, { width });
      return `${optimizedUrl} ${width}w`;
    }).join(', ');

    const sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';

    return { srcSet, sizes };
  }

  /**
   * Optimiza URLs en lote
   * @param {array} urls - Array de URLs
   * @param {object} options - Opciones de optimización
   * @returns {array} - Array de URLs optimizadas
   */
  optimizeBatch(urls, options = {}) {
    return urls.map(url => this.optimizeUrl(url, options));
  }

  /**
   * Crea URL de placeholder de baja calidad
   * @param {string} url - URL original
   * @returns {string} - URL del placeholder
   */
  createPlaceholder(url) {
    return this.optimizeUrl(url, {
      width: 50,
      quality: 10,
      format: 'auto'
    });
  }

  /**
   * Crea URL de thumbnail
   * @param {string} url - URL original
   * @param {number} size - Tamaño del thumbnail
   * @returns {string} - URL del thumbnail
   */
  createThumbnail(url, size = 150) {
    return this.optimizeUrl(url, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto'
    });
  }
}

// Instancia singleton
const cloudinaryOptimizer = new CloudinaryOptimizer();

export default cloudinaryOptimizer;