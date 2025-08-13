import { useState, useEffect, useCallback } from 'react';

// Hook para precargar imágenes
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [isPreloading, setIsPreloading] = useState(false);

  // Precarga una sola imagen
  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
        resolve(src);
      };
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }, [preloadedImages]);

  // Precarga múltiples imágenes
  const preloadImages = useCallback(async (imageUrls, priority = false) => {
    if (isPreloading && !priority) return;

    setIsPreloading(true);
    
    try {
      // Filtrar imágenes ya precargadas
      const imagesToPreload = imageUrls.filter(url => !preloadedImages.has(url));
      
      if (imagesToPreload.length === 0) {
        setIsPreloading(false);
        return;
      }

      // Precargar en paralelo con límite de concurrencia
      const batchSize = 3; // Máximo 3 imágenes simultáneas
      const results = [];

      for (let i = 0; i < imagesToPreload.length; i += batchSize) {
        const batch = imagesToPreload.slice(i, i + batchSize);
        const batchPromises = batch.map(url => preloadImage(url));
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Pequeña pausa entre lotes para no sobrecargar
        if (i + batchSize < imagesToPreload.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    } catch (error) {
      console.error('Error preloading images:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [preloadedImages, isPreloading, preloadImage]);

  // Precarga imágenes críticas (primera página)
  const preloadCriticalImages = useCallback(async (imageUrls) => {
    const criticalImages = imageUrls.slice(0, 8); // Primeras 8 imágenes
    return preloadImages(criticalImages, true);
  }, [preloadImages]);

  // Verifica si una imagen está precargada
  const isImagePreloaded = useCallback((src) => {
    return preloadedImages.has(src);
  }, [preloadedImages]);

  // Limpia imágenes precargadas (útil para liberar memoria)
  const clearPreloadedImages = useCallback(() => {
    setPreloadedImages(new Set());
  }, []);

  return {
    preloadImage,
    preloadImages,
    preloadCriticalImages,
    isImagePreloaded,
    clearPreloadedImages,
    isPreloading,
    preloadedCount: preloadedImages.size
  };
};

// Hook para precarga automática basada en scroll
export const useScrollBasedPreloader = (imageUrls, threshold = 0.5) => {
  const [visibleImages, setVisibleImages] = useState(new Set());
  const { preloadImages } = useImagePreloader();

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            const imageUrl = imageUrls[index];
            
            if (imageUrl && !visibleImages.has(imageUrl)) {
              setVisibleImages(prev => new Set([...prev, imageUrl]));
              
              // Precarga la imagen actual y las próximas 2
              const nextImages = imageUrls.slice(index, index + 3);
              preloadImages(nextImages);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '100px 0px' // Precarga 100px antes de que sea visible
      }
    );

    // Observar todos los contenedores de imagen
    const containers = document.querySelectorAll('[data-index]');
    containers.forEach(container => observer.observe(container));

    return () => observer.disconnect();
  }, [imageUrls, visibleImages, preloadImages, threshold]);

  return { visibleImages };
};
