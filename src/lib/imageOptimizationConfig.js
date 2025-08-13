/**
 * Configuración centralizada para optimización de imágenes
 * Permite ajustar fácilmente todos los parámetros de optimización
 */

export const IMAGE_OPTIMIZATION_CONFIG = {
  // Configuración de Cloudinary
  cloudinary: {
    // Tamaños por defecto para diferentes tipos de imágenes
    sizes: {
      thumbnail: 150,
      small: 400,
      medium: 800,
      large: 1200,
      xlarge: 1600
    },
    
    // Calidades por defecto
    qualities: {
      placeholder: 10,
      low: 30,
      medium: 60,
      high: 80,
      auto: 'auto'
    },
    
    // Formatos soportados
    formats: {
      auto: 'auto',
      webp: 'webp',
      jpeg: 'jpg',
      png: 'png'
    },
    
    // Configuración de crop
    crops: {
      scale: 'scale',
      fill: 'fill',
      fit: 'fit',
      limit: 'limit'
    }
  },

  // Configuración de lazy loading
  lazyLoading: {
    // Margen de precarga (en píxeles)
    rootMargin: '100px 0px',
    
    // Umbral de intersección
    threshold: 0.01,
    
    // Tiempo de espera para precarga de baja prioridad
    idleTimeout: 1000
  },

  // Configuración de preload
  preload: {
    // Número máximo de imágenes críticas a precargar
    criticalImagesLimit: 8,
    
    // Número máximo de imágenes en lote
    batchSize: 4,
    
    // Tiempo entre lotes (ms)
    batchDelay: 100
  },

  // Configuración de placeholders
  placeholders: {
    // Habilitar placeholders
    enabled: true,
    
    // Tamaño del placeholder de baja calidad
    lowQualitySize: 50,
    
    // Calidad del placeholder
    quality: 10,
    
    // Blur por defecto
    defaultBlur: 'blur-sm'
  },

  // Configuración de responsive images
  responsive: {
    // Habilitar imágenes responsivas
    enabled: true,
    
    // Breakpoints para diferentes tamaños de pantalla
    breakpoints: [
      { width: 400, media: '(max-width: 640px)' },
      { width: 600, media: '(max-width: 768px)' },
      { width: 800, media: '(max-width: 1024px)' },
      { width: 1200, media: '(max-width: 1280px)' },
      { width: 1600, media: '(min-width: 1281px)' }
    ],
    
    // Sizes por defecto para CSS
    defaultSizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
  },

  // Configuración de cache
  cache: {
    // Habilitar cache del navegador
    browserCache: true,
    
    // Habilitar service worker
    serviceWorker: true,
    
    // Tiempo de vida del cache (en segundos)
    maxAge: 31536000, // 1 año
    
    // Estrategia de cache
    strategy: 'cache-first' // 'cache-first' | 'network-first' | 'stale-while-revalidate'
  },

  // Configuración de compresión
  compression: {
    // Habilitar compresión del lado del cliente
    clientSide: false,
    
    // Calidad de compresión (0-1)
    quality: 0.8,
    
    // Formato de salida preferido
    preferredFormat: 'webp'
  },

  // Configuración de monitoreo
  monitoring: {
    // Habilitar métricas de rendimiento
    enabled: true,
    
    // Métricas a rastrear
    metrics: [
      'LCP', // Largest Contentful Paint
      'FID', // First Input Delay
      'CLS', // Cumulative Layout Shift
      'FCP', // First Contentful Paint
      'TTFB' // Time to First Byte
    ]
  }
};

/**
 * Configuraciones predefinidas para diferentes tipos de imágenes
 */
export const IMAGE_PRESETS = {
  // Imágenes hero/banner
  hero: {
    width: 1200,
    quality: 'auto',
    format: 'auto',
    priority: true,
    responsive: true,
    placeholder: true
  },

  // Imágenes de tarjetas
  card: {
    width: 400,
    quality: 'auto',
    format: 'auto',
    priority: false,
    responsive: true,
    placeholder: true
  },

  // Imágenes de galería
  gallery: {
    width: 800,
    quality: 'auto',
    format: 'auto',
    priority: false,
    responsive: true,
    placeholder: true
  },

  // Thumbnails
  thumbnail: {
    width: 150,
    quality: 60,
    format: 'auto',
    priority: false,
    responsive: false,
    placeholder: false
  },

  // Iconos
  icon: {
    width: 64,
    quality: 80,
    format: 'auto',
    priority: false,
    responsive: false,
    placeholder: false
  }
};

/**
 * Función para obtener configuración personalizada
 */
export const getImageConfig = (preset = 'card', customOptions = {}) => {
  const baseConfig = IMAGE_PRESETS[preset] || IMAGE_PRESETS.card;
  return { ...baseConfig, ...customOptions };
};

/**
 * Función para validar configuración
 */
export const validateImageConfig = (config) => {
  const errors = [];
  
  if (config.width && (config.width < 1 || config.width > 4000)) {
    errors.push('El ancho debe estar entre 1 y 4000 píxeles');
  }
  
  if (config.quality && config.quality !== 'auto' && (config.quality < 1 || config.quality > 100)) {
    errors.push('La calidad debe estar entre 1 y 100, o ser "auto"');
  }
  
  if (config.format && !Object.values(IMAGE_OPTIMIZATION_CONFIG.cloudinary.formats).includes(config.format)) {
    errors.push('Formato no soportado');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default IMAGE_OPTIMIZATION_CONFIG;
