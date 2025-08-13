"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import cloudinaryOptimizer from '../lib/cloudinaryOptimizer';
import advancedImageCache from '../lib/advancedImageCache';
import mobileOptimizer from '../lib/mobileOptimizer';
import { useSmartPreloader } from '../hooks/useSmartPreloader';
import { useMobileScrollOptimizer } from '../hooks/useMobileScrollOptimizer';
import { useBatchImageLoader } from '../hooks/useBatchImageLoader';

/**
 * Componente de imagen ultra-optimizado con todas las mejoras avanzadas
 * - Cache agresivo con IndexedDB
 * - Precarga inteligente predictiva
 * - Responsive automático con srcSet
 * - Lazy loading ultra-optimizado
 * - Optimización de Cloudinary sin tokens extras
 */
const UltraOptimizedImage = ({
  src,
  alt,
  className = "",
  fill = true,
  width,
  height,
  priority = false,
  sizes,
  onLoad,
  onError,
  placeholder = "blur",
  blurDataURL,
  quality = "auto",
  responsive = true,
  cacheStrategy = "aggressive",
  preloadStrategy = "smart",
  imageIndex = 0, // NUEVO: Índice para batch loading
  totalImages = 0, // NUEVO: Total de imágenes
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [loadStage, setLoadStage] = useState('placeholder');
  const [responsiveSrcSet, setResponsiveSrcSet] = useState('');
  const [cachedUrl, setCachedUrl] = useState('');
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const { observeElement, unobserveElement, networkSpeed, preloadImage } = useSmartPreloader();
  const { isScrolling } = useMobileScrollOptimizer();
  const { getLoadConfig, setPriority } = useBatchImageLoader(totalImages);

  // Generar blurDataURL automáticamente si no se proporciona
  const getBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    
    // Blur placeholder optimizado basado en el tipo de imagen
    if (src?.includes('cloudinary.com')) {
      // Para Cloudinary, generar un placeholder específico
      return generateCloudinaryBlurDataURL(src);
    }
    
    // Placeholder genérico ultra-optimizado
    return generateGenericBlurDataURL();
  }, [src, blurDataURL]);

  // Generar URLs optimizadas para diferentes tamaños (MÓVIL OPTIMIZADO)
  const generateResponsiveSources = useCallback((imageUrl) => {
    if (!responsive || !cloudinaryOptimizer.isCloudinaryUrl(imageUrl)) {
      return { optimizedUrl: imageUrl, srcSet: '' };
    }

    // CONFIGURACIÓN EXTREMA PARA MÓVIL
    const isMobile = mobileOptimizer.isMobile;
    const breakpoints = isMobile ? [
      // MÓVIL: Tamaños ULTRA-PEQUEÑOS para scroll rápido
      { width: 200, media: '(max-width: 480px)' }, // ERA 300
      { width: 250, media: '(max-width: 768px)' }  // ERA 400
    ] : [
      // DESKTOP: Tamaños normales
      { width: 400, media: '(max-width: 640px)' },
      { width: 600, media: '(max-width: 768px)' },
      { width: 800, media: '(max-width: 1024px)' },
      { width: 1200, media: '(max-width: 1280px)' },
      { width: 1600, media: '(min-width: 1281px)' }
    ];

    const sources = breakpoints.map(bp => {
      // USAR MOBILE OPTIMIZER para URLs móviles
      const optimizedUrl = isMobile ? 
        mobileOptimizer.optimizeCloudinaryUrl(imageUrl, {
          width: bp.width,
          quality: mobileOptimizer.getOptimalQuality()
        }) :
        cloudinaryOptimizer.optimizeUrl(imageUrl, {
          width: bp.width,
          quality: networkSpeed === 'slow' ? 60 : quality,
          format: 'auto'
        });
      return `${optimizedUrl} ${bp.width}w`;
    });

    // URL principal optimizada para móvil EXTREMO
    const mainWidth = isMobile ? 250 : 800; // ERA 400
    const mainOptimized = isMobile ?
      mobileOptimizer.optimizeCloudinaryUrl(imageUrl, {
        width: mainWidth,
        quality: mobileOptimizer.getOptimalQuality()
      }) :
      cloudinaryOptimizer.optimizeUrl(imageUrl, {
        width: mainWidth,
        quality: networkSpeed === 'slow' ? 60 : quality,
        format: 'auto'
      });

    return {
      optimizedUrl: mainOptimized,
      srcSet: sources.join(', ')
    };
  }, [responsive, quality, networkSpeed]);

  // Cargar imagen con cache inteligente
  const loadImageWithCache = useCallback(async (imageUrl, priorityLevel = 'medium') => {
    try {
      setLoadStage('loading');
      
      // 1. Intentar obtener del cache primero (OPTIMIZADO)
      if (cacheStrategy === 'aggressive') {
        const cached = await advancedImageCache.getFromCache(imageUrl);
        if (cached) {
          console.log('⚡ IMAGEN DESDE CACHE:', imageUrl);
          setCachedUrl(cached);
          setCurrentSrc(cached);
          setIsLoading(false);
          setLoadStage('cached');
          onLoad?.();
          return;
        }
      }

      // 2. CARGA DIRECTA Y RÁPIDA
      const { optimizedUrl, srcSet } = generateResponsiveSources(imageUrl);
      setResponsiveSrcSet(srcSet);

      // 3. Cargar imagen optimizada INMEDIATAMENTE
      setCurrentSrc(optimizedUrl);
      setLoadStage('network');

      // 4. Cache SOLO si la imagen es pequeña (< 500KB)
      if (cacheStrategy === 'aggressive') {
        // Cache en background muy reducido
        setTimeout(() => {
          advancedImageCache.cacheImage(optimizedUrl, 'low').catch(() => {
            // Fallar silenciosamente para no afectar performance
          });
        }, 2000); // Cache después de 2 segundos
      }

    } catch (error) {
      console.error('❌ Error cargando imagen ultra-optimizada:', {
        src: imageUrl,
        error: error.message
      });
      setIsError(true);
      setIsLoading(false);
      onError?.(error);
    }
  }, [cacheStrategy, generateResponsiveSources, onLoad, onError]);

  // Obtener configuración de carga por lotes
  const loadConfig = getLoadConfig(imageIndex);
  const shouldUseBatchPriority = totalImages > 0 && loadConfig.shouldLoad;
  const effectivePriority = priority || shouldUseBatchPriority;

  // Configurar Intersection Observer ultra-optimizado
  useEffect(() => {
    if (effectivePriority) {
      setIsInView(true);
      setPriority(imageIndex); // Notificar al batch loader
      return;
    }

    if (!imgRef.current) return;

    // Configuración EXTREMA del observer para móvil
    const mobileConfig = mobileOptimizer.getMobileLazyConfig();
    const rootMargin = mobileOptimizer.isMobile ? 
      '20px 0px' : // ULTRA-CERCANO para scroll rápido
      (networkSpeed === 'fast' ? '300px 0px' : '150px 0px');
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          // NO cargar durante scroll rápido en móvil
          if (mobileOptimizer.isMobile && isScrolling()) {
            console.log('📱 ⏸️ Pausando carga durante scroll rápido');
            return;
          }
          
          setIsInView(true);
          setPriority(imageIndex); // Activar prioridad en batch loader
          
          // NUNCA precargar en móvil
          if (!mobileOptimizer.isMobile && preloadStrategy === 'smart' && !mobileOptimizer.shouldUseDataSaver()) {
            observeElement(entry.target, src);
          }
          
          // Desconectar observer después de activar
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        rootMargin,
        threshold: mobileOptimizer.isMobile ? 0.25 : 0.01 // MÁS ESTRICTO para móvil
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (imgRef.current) {
        unobserveElement(imgRef.current);
      }
    };
  }, [priority, src, networkSpeed, preloadStrategy, observeElement, unobserveElement]);

  // Cargar imagen cuando entra en vista
  useEffect(() => {
    if (isInView && src && !currentSrc) {
      const priorityLevel = priority ? 'high' : 'medium';
      loadImageWithCache(src, priorityLevel);
    }
  }, [isInView, src, currentSrc, effectivePriority, loadImageWithCache]);

  // Limpiar URLs objeto cuando se desmonta
  useEffect(() => {
    return () => {
      if (cachedUrl && cachedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cachedUrl);
      }
    };
  }, [cachedUrl]);

  // Handlers optimizados
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setLoadStage('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((event) => {
    console.error('❌ Error en imagen ultra-optimizada:', {
      src: currentSrc,
      original: src,
      stage: loadStage,
      event: event?.type
    });
    setIsError(true);
    setIsLoading(false);
    onError?.(event);
  }, [currentSrc, src, loadStage, onError]);

  // Renderizado de error mejorado
  if (isError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        <div className="text-gray-400 text-center p-4">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">Imagen no disponible</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs mt-1 opacity-75">Modo: {loadStage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    >
      {/* Skeleton loading ultra-mejorado */}
      {isLoading && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="h-full w-full bg-gradient-to-br from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
          </div>
          
          {/* Indicador de progreso */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {loadStage === 'loading' && '⏳ Cargando'}
            {loadStage === 'network' && '🌐 Descargando'}
            {loadStage === 'cached' && '⚡ Desde cache'}
          </div>
        </div>
      )}

      {/* Imagen ultra-optimizada */}
      {isInView && currentSrc && (
        <NextImage
          src={currentSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          className={className}
          sizes={sizes || mobileOptimizer.getMobileSizes()}
          srcSet={responsiveSrcSet || undefined}
          placeholder={placeholder}
          blurDataURL={placeholder === "blur" ? getBlurDataURL() : undefined}
          quality={75} // Optimizado para balance velocidad/calidad
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: loadStage === 'loading' ? 'blur(5px)' : 'blur(0px)',
            transform: isLoading ? 'scale(1.02)' : 'scale(1)',
            transitionProperty: 'opacity, filter, transform'
          }}
          {...props}
        />
      )}

      {/* Indicador de cache en desarrollo */}
      {process.env.NODE_ENV === 'development' && loadStage === 'cached' && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
          ⚡ Cached
        </div>
      )}
    </div>
  );
};

// Funciones para generar blurDataURL automáticamente
function generateCloudinaryBlurDataURL(src) {
  // Generar un placeholder blur específico para imágenes de Cloudinary
  // Usar colores que representan camisas de fútbol
  const colors = [
    '#1f2937', '#374151', '#4b5563', // Grises para camisas neutras
    '#dc2626', '#ea580c', '#d97706', // Rojos y naranjas
    '#059669', '#0d9488', '#0891b2', // Verdes y azules
    '#7c3aed', '#a21caf', '#be185d'  // Purpuras y rosas
  ];
  
  // Seleccionar color basado en el hash del src para consistencia
  const colorIndex = src.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const primaryColor = colors[colorIndex];
  const secondaryColor = colors[(colorIndex + 1) % colors.length];
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `)}`;
}

function generateGenericBlurDataURL() {
  // Placeholder genérico ultra-optimizado para imágenes no-Cloudinary
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="generic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#generic)"/>
    </svg>
  `)}`;
}

// Estilos CSS adicionales para animaciones
const additionalStyles = `
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

// Inyectar estilos si no existen
if (typeof window !== 'undefined' && !document.getElementById('ultra-optimized-styles')) {
  const style = document.createElement('style');
  style.id = 'ultra-optimized-styles';
  style.textContent = additionalStyles;
  document.head.appendChild(style);
}

export default UltraOptimizedImage;
