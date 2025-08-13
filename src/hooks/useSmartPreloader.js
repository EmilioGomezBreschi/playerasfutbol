import { useState, useEffect, useCallback, useRef } from 'react';
import cloudinaryOptimizer from '../lib/cloudinaryOptimizer';

/**
 * Hook de precarga ultra-inteligente que predice qué imágenes cargar
 * basado en comportamiento del usuario y patrones de navegación
 */
export const useSmartPreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());
  const [networkSpeed, setNetworkSpeed] = useState('fast');
  const observerRef = useRef(null);
  const preloadQueueRef = useRef([]);
  const priorityMapRef = useRef(new Map());

  // Detectar velocidad de red
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateNetworkSpeed = () => {
        if (connection.effectiveType === '4g') {
          setNetworkSpeed('fast');
        } else if (connection.effectiveType === '3g') {
          setNetworkSpeed('medium');
        } else {
          setNetworkSpeed('slow');
        }
      };
      
      updateNetworkSpeed();
      connection.addEventListener('change', updateNetworkSpeed);
      
      return () => connection.removeEventListener('change', updateNetworkSpeed);
    }
  }, []);

  // Configurar Intersection Observer para predicción
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const imageUrl = element.dataset.preloadUrl;
          
          if (entry.isIntersecting && imageUrl) {
            // Prioridad alta: imagen está entrando en vista
            priorityMapRef.current.set(imageUrl, 'high');
            preloadImage(imageUrl, 'high');
          } else if (entry.intersectionRatio > 0.1 && imageUrl) {
            // Prioridad media: imagen está cerca
            priorityMapRef.current.set(imageUrl, 'medium');
            preloadImage(imageUrl, 'medium');
          }
        });
      },
      {
        rootMargin: '200px 0px', // Precargar 200px antes
        threshold: [0, 0.1, 0.5, 1]
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Precargar imagen con control de prioridad
  const preloadImage = useCallback(async (url, priority = 'medium') => {
    if (preloadedImages.has(url) || loadingImages.has(url)) {
      return Promise.resolve();
    }

    // Optimizar URL antes de precargar
    const optimizedUrl = cloudinaryOptimizer.optimizeUrl(url, {
      width: priority === 'high' ? 800 : 400,
      quality: networkSpeed === 'slow' ? 60 : 'auto',
      format: 'auto'
    });

    setLoadingImages(prev => new Set([...prev, url]));

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Configurar prioridad de fetch
      if (priority === 'high') {
        img.fetchPriority = 'high';
      } else if (priority === 'low') {
        img.fetchPriority = 'low';
      }

      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        resolve(optimizedUrl);
      };

      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        reject(new Error(`Failed to preload: ${url}`));
      };

      img.src = optimizedUrl;
    });
  }, [preloadedImages, loadingImages, networkSpeed]);

  // Precargar en lote con control de concurrencia BALANCEADO
  const preloadBatch = useCallback(async (urls, priority = 'medium') => {
    const maxConcurrent = networkSpeed === 'slow' ? 2 : networkSpeed === 'medium' ? 4 : 6; // BALANCEADO
    const chunks = [];
    
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      chunks.push(urls.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => preloadImage(url, priority))
      );
      
      // Pausa entre lotes para no saturar la red
      if (networkSpeed === 'slow') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [preloadImage, networkSpeed]);

  // Precargar imágenes críticas inmediatamente MÍNIMO
  const preloadCritical = useCallback((urls) => {
    const criticalUrls = urls.slice(0, 3); // MÍNIMO: Solo 3
    return preloadBatch(criticalUrls, 'high');
  }, [preloadBatch]);

  // Observar elemento para precarga predictiva
  const observeElement = useCallback((element, imageUrl) => {
    if (observerRef.current && element) {
      element.dataset.preloadUrl = imageUrl;
      observerRef.current.observe(element);
    }
  }, []);

  // Desobservar elemento
  const unobserveElement = useCallback((element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // Precargar siguiente página (para paginación)
  const preloadNextPage = useCallback(async (imageUrls, currentPage) => {
    // Solo precargar si hay buena conexión
    if (networkSpeed === 'fast') {
      const nextPageUrls = imageUrls.slice(currentPage * 20, (currentPage + 1) * 20);
      await preloadBatch(nextPageUrls, 'low');
    }
  }, [preloadBatch, networkSpeed]);

  // Limpiar cache de imágenes
  const clearPreloadCache = useCallback(() => {
    setPreloadedImages(new Set());
    setLoadingImages(new Set());
    priorityMapRef.current.clear();
  }, []);

  // Estadísticas de precarga
  const getStats = useCallback(() => {
    return {
      preloadedCount: preloadedImages.size,
      loadingCount: loadingImages.size,
      networkSpeed,
      totalProcessed: preloadedImages.size + loadingImages.size
    };
  }, [preloadedImages.size, loadingImages.size, networkSpeed]);

  return {
    // Estados
    preloadedImages,
    loadingImages,
    networkSpeed,
    
    // Métodos principales
    preloadImage,
    preloadBatch,
    preloadCritical,
    preloadNextPage,
    
    // Observación
    observeElement,
    unobserveElement,
    
    // Utilidades
    clearPreloadCache,
    getStats,
    
    // Helpers
    isPreloaded: useCallback((url) => preloadedImages.has(url), [preloadedImages]),
    isLoading: useCallback((url) => loadingImages.has(url), [loadingImages])
  };
};

/**
 * Hook para precarga basada en scroll con predicción de dirección
 */
export const useScrollPreloader = (imageUrls = []) => {
  const [scrollDirection, setScrollDirection] = useState('down');
  const [scrollSpeed, setScrollSpeed] = useState('normal');
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const { preloadImage, preloadBatch } = useSmartPreloader();

  useEffect(() => {
    let timeoutId;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      const timeDelta = currentTime - lastScrollTime.current;
      
      // Detectar dirección
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      
      // Detectar velocidad
      const speed = scrollDelta / timeDelta;
      if (speed > 2) {
        setScrollSpeed('fast');
      } else if (speed > 0.5) {
        setScrollSpeed('normal');
      } else {
        setScrollSpeed('slow');
      }
      
      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
      
      // Precargar basado en dirección y velocidad
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (scrollDirection === 'down' && scrollSpeed !== 'slow') {
          // Precargar siguientes imágenes
          const viewportHeight = window.innerHeight;
          const scrollProgress = currentScrollY / (document.body.scrollHeight - viewportHeight);
          const nextImages = Math.floor(scrollProgress * imageUrls.length) + 5;
          
          if (nextImages < imageUrls.length) {
            preloadBatch(imageUrls.slice(nextImages, nextImages + 3), 'medium');
          }
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollDirection, scrollSpeed, imageUrls, preloadBatch]);

  return {
    scrollDirection,
    scrollSpeed,
    preloadImage,
    preloadBatch
  };
};

export default useSmartPreloader;
