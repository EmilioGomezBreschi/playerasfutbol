import { useState, useEffect, useCallback } from 'react';
import cloudinaryOptimizer from '../lib/cloudinaryOptimizer';

/**
 * Hook para optimización inteligente de imágenes de Cloudinary
 * Incluye responsive images, placeholders y optimización automática
 */
export const useCloudinaryOptimization = (imageUrl, options = {}) => {
  const [optimizedData, setOptimizedData] = useState({
    url: imageUrl,
    srcSet: '',
    sizes: '',
    placeholder: '',
    thumbnail: '',
    isOptimized: false
  });

  const [isLoading, setIsLoading] = useState(true);

  // Configuración por defecto
  const defaultOptions = {
    width: 800,
    quality: 'auto',
    format: 'auto',
    responsive: true,
    placeholder: true,
    thumbnail: false
  };

  const config = { ...defaultOptions, ...options };

  // Optimizar imagen principal
  const optimizeMainImage = useCallback(() => {
    if (!imageUrl) return;

    const optimizedUrl = cloudinaryOptimizer.optimizeUrl(imageUrl, {
      width: config.width,
      quality: config.quality,
      format: config.format
    });

    return optimizedUrl;
  }, [imageUrl, config.width, config.quality, config.format]);

  // Generar responsive images
  const generateResponsiveImages = useCallback(() => {
    if (!imageUrl || !config.responsive) return { srcSet: '', sizes: '' };

    const responsiveData = cloudinaryOptimizer.generateResponsiveImages(imageUrl, [
      400, 600, 800, 1200, 1600
    ]);

    return responsiveData;
  }, [imageUrl, config.responsive]);

  // Generar placeholder
  const generatePlaceholder = useCallback(() => {
    if (!imageUrl || !config.placeholder) return '';

    return cloudinaryOptimizer.createPlaceholder(imageUrl);
  }, [imageUrl, config.placeholder]);

  // Generar thumbnail
  const generateThumbnail = useCallback(() => {
    if (!imageUrl || !config.thumbnail) return '';

    return cloudinaryOptimizer.createThumbnail(imageUrl, 150);
  }, [imageUrl, config.thumbnail]);

  // Optimización completa
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const mainUrl = optimizeMainImage();
      const responsive = generateResponsiveImages();
      const placeholder = generatePlaceholder();
      const thumbnail = generateThumbnail();

      setOptimizedData({
        url: mainUrl || imageUrl,
        srcSet: responsive.srcSet || '',
        sizes: responsive.sizes || '',
        placeholder: placeholder || '',
        thumbnail: thumbnail || '',
        isOptimized: !!mainUrl
      });
    } catch (error) {
      console.error('Error optimizando imagen:', error);
      setOptimizedData({
        url: imageUrl,
        srcSet: '',
        sizes: '',
        placeholder: '',
        thumbnail: '',
        isOptimized: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, config]);

  // Función para optimizar con opciones personalizadas
  const optimizeWithOptions = useCallback((customOptions) => {
    const mergedOptions = { ...config, ...customOptions };
    
    if (!imageUrl) return null;

    return cloudinaryOptimizer.optimizeUrl(imageUrl, mergedOptions);
  }, [imageUrl, config]);

  // Función para generar múltiples tamaños
  const generateMultipleSizes = useCallback((widths) => {
    if (!imageUrl) return [];

    return widths.map(width => ({
      width,
      url: cloudinaryOptimizer.optimizeUrl(imageUrl, { width })
    }));
  }, [imageUrl]);

  return {
    ...optimizedData,
    isLoading,
    optimizeWithOptions,
    generateMultipleSizes,
    isCloudinary: cloudinaryOptimizer.isCloudinaryUrl(imageUrl)
  };
};

/**
 * Hook para optimización en lote de múltiples imágenes
 */
export const useBatchCloudinaryOptimization = (imageUrls, options = {}) => {
  const [optimizedBatch, setOptimizedBatch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const optimized = cloudinaryOptimizer.optimizeBatch(imageUrls, options);
      
      setOptimizedBatch(optimized.map((url, index) => ({
        original: imageUrls[index],
        optimized: url,
        isOptimized: url !== imageUrls[index]
      })));
    } catch (error) {
      console.error('Error optimizando lote de imágenes:', error);
      setOptimizedBatch(imageUrls.map(url => ({
        original: url,
        optimized: url,
        isOptimized: false
      })));
    } finally {
      setIsLoading(false);
    }
  }, [imageUrls, options]);

  return {
    optimizedBatch,
    isLoading,
    totalImages: imageUrls?.length || 0,
    optimizedCount: optimizedBatch.filter(img => img.isOptimized).length
  };
};
