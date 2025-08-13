"use client";

import { useEffect, useState } from 'react';
import advancedImageCache from '../lib/advancedImageCache';
import performanceMonitor, { usePerformanceTracking } from '../lib/performanceMonitor';
import EmergencyCleanup from '../lib/emergencyCleanup';

/**
 * Gestor ultra-inteligente de optimización de imágenes
 * Coordina todas las estrategias de optimización automáticamente
 */
const ImageOptimizationManager = ({ children }) => {
  const [isOptimizationActive, setIsOptimizationActive] = useState(false);
  const [networkStrategy, setNetworkStrategy] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [performanceGrade, setPerformanceGrade] = useState(null);
  const { getCurrentMetrics } = usePerformanceTracking();

  // Inicializar manager
  useEffect(() => {
    setIsOptimizationActive(true);
    
    // DETECTAR EMERGENCIA: Si cache > 400 imágenes o score < 25% (MÁS CONSERVADOR)
    const checkEmergency = async () => {
      try {
        const [cache, metrics] = await Promise.all([
          advancedImageCache.getCacheStats(),
          getCurrentMetrics()
        ]);
        
        const shouldCleanup = cache.entries > 400 || 
                            (metrics.performance && metrics.performance.score < 25);
        
        if (shouldCleanup) {
          console.log('🚨 EMERGENCIA DETECTADA (CONSERVADOR):', { 
            cacheEntries: cache.entries, 
            score: metrics.performance?.score,
            threshold: 'cache > 400 o score < 25%'
          });
          
          // ESPERAR 5 segundos antes de limpiar para evitar problemas
          setTimeout(() => {
            const cleanup = new EmergencyCleanup();
            cleanup.performEmergencyCleanup();
          }, 5000);
        }
      } catch (error) {
        console.warn('Error en check de emergencia:', error);
      }
    };
    
    // Check inmediato
    checkEmergency();
    
    // Actualizar stats cada 10 segundos
    const statsInterval = setInterval(async () => {
      try {
        const [cache, metrics] = await Promise.all([
          advancedImageCache.getCacheStats(),
          getCurrentMetrics()
        ]);
        
        setCacheStats(cache);
        setPerformanceGrade(metrics.performance);
      } catch (error) {
        console.warn('Error obteniendo stats:', error);
      }
    }, 10000);

    return () => clearInterval(statsInterval);
  }, [getCurrentMetrics]);

  // Escuchar eventos de optimización
  useEffect(() => {
    const handleNetworkStrategyUpdate = (event) => {
      setNetworkStrategy(event.detail);
      
      // Aplicar estrategia automáticamente
      applyNetworkStrategy(event.detail);
    };

    const handleLCPOptimization = (event) => {
      console.log('🔧 Optimizando LCP automáticamente...', event.detail);
      
      // Activar precarga agresiva
      triggerAggressivePreload();
    };

    window.addEventListener('network-strategy-update', handleNetworkStrategyUpdate);
    window.addEventListener('optimize-lcp', handleLCPOptimization);

    return () => {
      window.removeEventListener('network-strategy-update', handleNetworkStrategyUpdate);
      window.removeEventListener('optimize-lcp', handleLCPOptimization);
    };
  }, []);

  // Aplicar estrategia de red
  const applyNetworkStrategy = (strategy) => {
    // Ajustar configuración global de imágenes
    const event = new CustomEvent('image-strategy-update', {
      detail: {
        quality: strategy.quality,
        preloadLimit: strategy.preloadLimit,
        cacheAggressive: strategy.cacheAggressive,
        lazyThreshold: strategy.lazyThreshold
      }
    });
    
    window.dispatchEvent(event);
  };

  // Activar precarga agresiva
  const triggerAggressivePreload = () => {
    // Obtener todas las imágenes visibles y próximas
    const images = document.querySelectorAll('img[data-src], img[src*="cloudinary"]');
    const imageUrls = Array.from(images)
      .slice(0, 6) // Solo las primeras 6
      .map(img => img.src || img.dataset.src)
      .filter(Boolean);

    if (imageUrls.length > 0) {
      advancedImageCache.preloadImages(imageUrls, 'high');
    }
  };

  // Renderizado solo en desarrollo para mostrar stats
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  return (
    <>
      {children}
      
      {/* Panel de desarrollo */}
      {isOptimizationActive && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">⚡</span>
            <span className="font-semibold">Optimización Activa</span>
          </div>
          
          {cacheStats && (
            <div className="space-y-1">
              <div>📦 Cache: {cacheStats.entries} imágenes</div>
              <div>💾 Tamaño: {Math.round(cacheStats.totalSize / 1024 / 1024 * 100) / 100}MB</div>
              {cacheStats.compressionRatio && (
                <div>🗜️ Compresión: {Math.round(cacheStats.compressionRatio * 100)}%</div>
              )}
            </div>
          )}
          
          {performanceGrade && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="flex items-center gap-2">
                <span>🏆 Score:</span>
                <span className={`font-bold ${
                  performanceGrade.grade === 'A' ? 'text-green-400' :
                  performanceGrade.grade === 'B' ? 'text-yellow-400' :
                  performanceGrade.grade === 'C' ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {performanceGrade.grade} ({performanceGrade.score}%)
                </span>
              </div>
            </div>
          )}
          
          {networkStrategy && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div>📶 Red: {networkStrategy.quality === 'auto' ? '4G+' : `${networkStrategy.quality}% calidad`}</div>
              <div>🔄 Precarga: {networkStrategy.preloadLimit} imgs</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageOptimizationManager;
