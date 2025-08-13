"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import cloudinaryOptimizer from '../lib/cloudinaryOptimizer';
import mobileOptimizer from '../lib/mobileOptimizer';

/**
 * Versión segura de UltraOptimizedImage sin funciones experimentales
 * Para usar en caso de errores de producción
 */
const SafeUltraOptimizedImage = ({
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
  quality = "auto",
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generar blurDataURL simple
  const getBlurDataURL = useCallback(() => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>
    `)}`;
  }, []);

  // Optimización simple para móvil
  const optimizeForMobile = useCallback((imageUrl) => {
    if (!imageUrl) return imageUrl;
    
    try {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        // Móvil: URL más pequeña
        if (imageUrl.includes('cloudinary.com')) {
          return mobileOptimizer.optimizeCloudinaryUrl(imageUrl, {
            width: 300,
            quality: 40
          });
        }
      }
      return imageUrl;
    } catch (error) {
      console.warn('Error optimizando para móvil:', error);
      return imageUrl;
    }
  }, []);

  // Configurar Intersection Observer simple
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    try {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );

      observerRef.current.observe(imgRef.current);
    } catch (error) {
      console.warn('Error con Intersection Observer:', error);
      setIsInView(true); // Fallback: cargar inmediatamente
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Cargar imagen cuando entra en vista
  useEffect(() => {
    if (isInView && src && !currentSrc) {
      const optimizedSrc = optimizeForMobile(src);
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, src, currentSrc, optimizeForMobile]);

  // Handlers
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((event) => {
    console.error('❌ Error cargando imagen segura:', { src, event });
    setIsError(true);
    setIsLoading(false);
    onError?.(event);
  }, [src, onError]);

  // Renderizado de error
  if (isError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gray-200 flex items-center justify-center`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Imagen no disponible</p>
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
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded"></div>
      )}

      {/* Imagen */}
      {isInView && currentSrc && (
        <NextImage
          src={currentSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          className={className}
          sizes={sizes || "100vw"}
          placeholder={placeholder}
          blurDataURL={placeholder === "blur" ? getBlurDataURL() : undefined}
          quality={75}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default SafeUltraOptimizedImage;
