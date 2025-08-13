import { useState, useEffect, useCallback, useRef } from 'react';
import mobileOptimizer from '../lib/mobileOptimizer';

/**
 * Hook para carga por lotes inteligente de imágenes
 * Resuelve el problema de camisas 6+ tardando minutos
 */
export const useBatchImageLoader = (totalImages = 0) => {
  const [currentBatch, setCurrentBatch] = useState(0);
  const [loadedBatches, setLoadedBatches] = useState(new Set());
  const [priorityImages, setPriorityImages] = useState(new Set());
  const batchSizeRef = useRef(mobileOptimizer.isMobile ? 4 : 6);
  const loadingBatchRef = useRef(false);

  // Configuración dinámica según dispositivo
  const config = {
    batchSize: batchSizeRef.current,
    maxConcurrent: mobileOptimizer.isMobile ? 2 : 4,
    preloadDistance: mobileOptimizer.isMobile ? 1 : 2, // Lotes por adelantado
    loadDelay: mobileOptimizer.isMobile ? 200 : 100
  };

  console.log('📦 BATCH LOADER configurado:', config);

  // Calcular qué lote corresponde a cada imagen
  const getBatchForIndex = useCallback((index) => {
    return Math.floor(index / config.batchSize);
  }, [config.batchSize]);

  // Obtener imágenes del lote actual
  const getBatchImages = useCallback((batchNumber) => {
    const start = batchNumber * config.batchSize;
    const end = start + config.batchSize;
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [config.batchSize]);

  // Marcar imagen como prioritaria
  const setPriority = useCallback((index) => {
    const batch = getBatchForIndex(index);
    
    setPriorityImages(prev => {
      const newSet = new Set(prev);
      
      // Agregar toda la imagen del lote como prioritarias
      const batchImages = getBatchImages(batch);
      batchImages.forEach(imgIndex => {
        if (imgIndex < totalImages) {
          newSet.add(imgIndex);
        }
      });
      
      return newSet;
    });

    // Activar carga del lote si no está cargado
    if (!loadedBatches.has(batch)) {
      loadBatch(batch);
    }
  }, [getBatchForIndex, getBatchImages, totalImages, loadedBatches]);

  // Cargar lote específico
  const loadBatch = useCallback(async (batchNumber) => {
    if (loadingBatchRef.current || loadedBatches.has(batchNumber)) {
      return;
    }

    loadingBatchRef.current = true;
    console.log(`📦 Cargando lote ${batchNumber}...`);

    try {
      const batchImages = getBatchImages(batchNumber);
      
      // Cargar imágenes del lote en paralelo (limitado)
      const chunks = [];
      for (let i = 0; i < batchImages.length; i += config.maxConcurrent) {
        chunks.push(batchImages.slice(i, i + config.maxConcurrent));
      }

      for (const chunk of chunks) {
        // Cargar chunk en paralelo
        await Promise.allSettled(
          chunk.map(async (imageIndex) => {
            if (imageIndex >= totalImages) return;
            
            // Simular prioridad para estas imágenes
            return new Promise(resolve => {
              setTimeout(() => {
                console.log(`📷 Imagen ${imageIndex} lista para cargar`);
                resolve();
              }, config.loadDelay);
            });
          })
        );
      }

      // Marcar lote como cargado
      setLoadedBatches(prev => new Set([...prev, batchNumber]));
      setCurrentBatch(batchNumber);
      
      console.log(`✅ Lote ${batchNumber} cargado`);

      // Precargar siguientes lotes si es necesario
      for (let i = 1; i <= config.preloadDistance; i++) {
        const nextBatch = batchNumber + i;
        const nextBatchStart = nextBatch * config.batchSize;
        
        if (nextBatchStart < totalImages && !loadedBatches.has(nextBatch)) {
          setTimeout(() => {
            loadBatch(nextBatch);
          }, i * 500); // Stagger precarga
        }
      }

    } catch (error) {
      console.error(`❌ Error cargando lote ${batchNumber}:`, error);
    } finally {
      loadingBatchRef.current = false;
    }
  }, [getBatchImages, config, totalImages, loadedBatches]);

  // Auto-detectar necesidad de carga basado en scroll
  useEffect(() => {
    if (totalImages === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calcular progreso de scroll (0-1)
      const scrollProgress = scrollY / (documentHeight - windowHeight);
      
      // Estimar qué lote debería estar cargado
      const estimatedImageIndex = Math.floor(scrollProgress * totalImages);
      const neededBatch = getBatchForIndex(estimatedImageIndex);
      
      // Cargar lote si no está cargado
      if (!loadedBatches.has(neededBatch)) {
        loadBatch(neededBatch);
      }
    };

    // Throttle scroll para performance
    let scrollTimeout;
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Cargar primer lote inmediatamente
    loadBatch(0);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [totalImages, getBatchForIndex, loadBatch, loadedBatches]);

  // Verificar si imagen tiene prioridad
  const hasPriority = useCallback((index) => {
    return priorityImages.has(index) || index < config.batchSize; // Primer lote siempre prioritario
  }, [priorityImages, config.batchSize]);

  // Obtener configuración de carga para una imagen
  const getLoadConfig = useCallback((index) => {
    const batch = getBatchForIndex(index);
    const isLoaded = loadedBatches.has(batch);
    const isPriority = hasPriority(index);
    
    return {
      priority: isPriority,
      batchLoaded: isLoaded,
      batchNumber: batch,
      shouldLoad: isLoaded || isPriority,
      loadDelay: isPriority ? 0 : batch * 200 // Delay progresivo
    };
  }, [getBatchForIndex, loadedBatches, hasPriority]);

  // Stats para debugging
  const getStats = useCallback(() => {
    return {
      totalImages,
      currentBatch,
      loadedBatches: Array.from(loadedBatches),
      priorityImages: Array.from(priorityImages),
      batchSize: config.batchSize,
      isLoading: loadingBatchRef.current
    };
  }, [totalImages, currentBatch, loadedBatches, priorityImages, config.batchSize]);

  return {
    setPriority,
    hasPriority,
    getLoadConfig,
    loadBatch,
    getStats,
    currentBatch,
    loadedBatches
  };
};

export default useBatchImageLoader;
