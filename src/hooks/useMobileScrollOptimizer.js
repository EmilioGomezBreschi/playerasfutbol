import { useEffect, useCallback, useRef } from 'react';
import mobileOptimizer from '../lib/mobileOptimizer';

/**
 * Hook para optimizar scroll ultra-agresivo en móvil
 * Resuelve el problema de scroll rápido lento
 */
export const useMobileScrollOptimizer = () => {
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // Detectar scroll rápido
  const detectFastScroll = useCallback((currentTime) => {
    const timeDiff = currentTime - lastScrollTimeRef.current;
    lastScrollTimeRef.current = currentTime;
    
    // Si scroll es muy rápido (< 16ms entre eventos), es scroll rápido
    return timeDiff < 16;
  }, []);

  // Optimizar scroll para móvil
  useEffect(() => {
    if (!mobileOptimizer.isMobile) return;

    let rafId;
    let scrollCount = 0;

    const handleScroll = () => {
      const currentTime = performance.now();
      const isFastScroll = detectFastScroll(currentTime);
      scrollCount++;

      // Cancelar RAF anterior
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Si es scroll rápido, usar debounce más agresivo
      const debounceTime = isFastScroll ? 150 : 50;

      // Marcar como scrolling
      isScrollingRef.current = true;

      // Clear timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // OPTIMIZACIONES DURANTE SCROLL RÁPIDO:
      if (isFastScroll) {
        // 1. Pausar animaciones CSS
        document.body.style.setProperty('--scroll-behavior', 'auto');
        
        // 2. Reducir calidad de imágenes temporalmente
        document.documentElement.style.setProperty('--image-rendering', 'auto');
        
        // 3. Pausar lazy loading agresivo
        window.dispatchEvent(new CustomEvent('pause-lazy-loading'));
      }

      // Detectar fin de scroll con debounce
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        scrollCount = 0;

        // Restaurar optimizaciones
        document.body.style.removeProperty('--scroll-behavior');
        document.documentElement.style.removeProperty('--image-rendering');
        
        // Reactivar lazy loading
        window.dispatchEvent(new CustomEvent('resume-lazy-loading'));

        console.log('📱 Scroll terminado - Reactivando optimizaciones');
      }, debounceTime);

      // RAF para optimización suave
      rafId = requestAnimationFrame(() => {
        // Solo procesar cada 3er scroll en móvil para performance
        if (scrollCount % 3 === 0) {
          // Procesar lazy loading reducido
          window.dispatchEvent(new CustomEvent('optimized-scroll', {
            detail: { isFastScroll, scrollCount }
          }));
        }
      });
    };

    // Event listener optimizado
    window.addEventListener('scroll', handleScroll, { 
      passive: true,
      capture: false 
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [detectFastScroll]);

  // Método para verificar si está scrolling
  const isScrolling = useCallback(() => {
    return isScrollingRef.current;
  }, []);

  return {
    isScrolling,
    isMobile: mobileOptimizer.isMobile
  };
};

export default useMobileScrollOptimizer;
