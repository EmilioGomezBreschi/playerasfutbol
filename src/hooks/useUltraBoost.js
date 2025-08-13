import { useEffect, useCallback } from 'react';
import { useSmartPreloader } from './useSmartPreloader';
import advancedImageCache from '../lib/advancedImageCache';

/**
 * Hook de boost ultra-agresivo para conexiones 4G+
 * Precarga masiva e instantánea para máximo rendimiento
 */
export const useUltraBoost = () => {
  const { preloadBatch, preloadCritical, networkSpeed } = useSmartPreloader();

  // Boost ultra-agresivo al montar
  useEffect(() => {
    if (networkSpeed === 'fast' || networkSpeed === '4g') {
      triggerUltraBoost();
    }
  }, [networkSpeed]);

  const triggerUltraBoost = useCallback(async () => {
    console.log('🚀 ACTIVANDO BOOST ULTRA-AGRESIVO...');
    
    // 1. Obtener imágenes visibles de la página (REDUCIDO)
    const allImages = Array.from(document.querySelectorAll('img'))
      .map(img => img.src || img.dataset.src)
      .filter(src => src && src.includes('cloudinary.com'))
      .slice(0, 10); // MÁXIMO 10 imágenes (REDUCIDO)

    if (allImages.length === 0) return;

    console.log(`🔥 Boost: Precargando ${allImages.length} imágenes...`);

    // 2. Precarga crítica de las primeras 4 (REDUCIDO)
    const critical = allImages.slice(0, 4);
    preloadCritical(critical);

    // 3. Precarga agresiva del resto en chunks (REDUCIDO)
    const remaining = allImages.slice(4);
    setTimeout(() => {
      preloadBatch(remaining, 'medium');
    }, 500);

    // 4. Cache agresivo en background
    setTimeout(() => {
      advancedImageCache.preloadImages(allImages, 'medium');
    }, 1000);

  }, [preloadBatch, preloadCritical]);

  // Boost automático en scroll
  const boostOnScroll = useCallback(() => {
    // Detectar imágenes que están entrando en vista
    const observer = new IntersectionObserver(
      (entries) => {
        const newImages = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.src || entry.target.dataset.src)
          .filter(Boolean);

        if (newImages.length > 0) {
          preloadBatch(newImages, 'high');
        }
      },
      { rootMargin: '500px 0px' } // Muy agresivo: 500px antes
    );

    // Observar todas las imágenes
    document.querySelectorAll('img').forEach(img => {
      observer.observe(img);
    });

    return () => observer.disconnect();
  }, [preloadBatch]);

  // Boost predictivo basado en hover (CORREGIDO)
  const boostOnHover = useCallback(() => {
    const handleMouseEnter = (event) => {
      // ARREGLAR: Verificar que event.target y closest existan
      if (!event.target || typeof event.target.closest !== 'function') {
        return;
      }

      try {
        const link = event.target.closest('a[href]');
        if (!link || !link.href) return;

        // Predecir qué página visitará y precargar sus imágenes
        const href = link.href;
        if (href.includes('/camisa/') || href.includes('/retro') || href.includes('/jugador') || href.includes('/aficionado')) {
          console.log('🎯 Boost predictivo activado para:', href);
          
          // Simular precarga de imágenes de la página destino
          setTimeout(() => {
            triggerUltraBoost();
          }, 100);
        }
      } catch (error) {
        console.warn('Error en boost hover:', error);
      }
    };

    // ARREGLAR: Usar eventos específicos en lugar de global
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleMouseEnter);
      });
    };
  }, [triggerUltraBoost]);

  // Boost automático REDUCIDO para evitar sobrecarga
  const continuousBoost = useCallback(() => {
    let lastActivity = Date.now();
    let boostCount = 0;
    const maxBoosts = 3; // MÁXIMO 3 boosts automáticos
    
    const activityEvents = ['scroll', 'click']; // REDUCIR eventos
    const updateActivity = () => {
      lastActivity = Date.now();
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    const boostInterval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      // Si hay actividad reciente Y no hemos excedido el límite
      if (timeSinceActivity < 30000 && boostCount < maxBoosts) {
        triggerUltraBoost();
        boostCount++;
        console.log(`🔄 Boost automático ${boostCount}/${maxBoosts}`);
      }
    }, 15000); // Cada 15 segundos (REDUCIDO)

    return () => {
      clearInterval(boostInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [triggerUltraBoost]);

  // Configurar todos los boosts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanup = [
      boostOnScroll(),
      boostOnHover(),
      continuousBoost()
    ];

    return () => cleanup.forEach(fn => fn?.());
  }, [boostOnScroll, boostOnHover, continuousBoost]);

  return {
    triggerUltraBoost,
    networkSpeed
  };
};

export default useUltraBoost;
