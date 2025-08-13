"use client";

import { useEffect, useState } from 'react';
import { useBatchImageLoader } from '../hooks/useBatchImageLoader';

/**
 * Monitor de carga por lotes para debugging en desarrollo
 */
const BatchLoadingMonitor = ({ totalImages = 0 }) => {
  const [stats, setStats] = useState(null);
  const { getStats } = useBatchImageLoader(totalImages);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateStats = () => {
      setStats(getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [getStats]);

  if (process.env.NODE_ENV !== 'development' || !stats) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-blue-900/90 text-white text-xs p-3 rounded-lg max-w-xs z-50">
      <div className="font-semibold mb-2">📦 Batch Loading</div>
      <div className="space-y-1">
        <div>Total: {stats.totalImages} imágenes</div>
        <div>Lote actual: {stats.currentBatch}</div>
        <div>Tamaño lote: {stats.batchSize}</div>
        <div>Lotes cargados: [{stats.loadedBatches.join(', ')}]</div>
        <div>Prioritarias: {stats.priorityImages.length}</div>
        <div className={`${stats.isLoading ? 'text-yellow-300' : 'text-green-300'}`}>
          {stats.isLoading ? '⏳ Cargando...' : '✅ Listo'}
        </div>
      </div>
    </div>
  );
};

export default BatchLoadingMonitor;
