"use client";

import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import cloudinaryOptimizer from '../lib/cloudinaryOptimizer';

/**
 * Componente de imagen progresiva simplificado y confiable
 * Carga optimizada con Cloudinary automáticamente
 */
const ProgressiveImage = ({
  src,
  alt,
  className = "",
  fill = true,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  onLoad,
  onError,
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  ...props
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Optimizar URL de Cloudinary
  useEffect(() => {
    if (src) {
      try {
        const optimized = cloudinaryOptimizer.optimizeUrl(src, {
          width: 800,
          quality: 'auto',
          format: 'auto'
        });
        setOptimizedSrc(optimized);
        
        // Debug log para desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('🖼️ Imagen optimizada:', { original: src, optimized });
        }
      } catch (error) {
        console.error('Error optimizando URL:', error);
        setOptimizedSrc(src); // Usar la URL original si falla la optimización
      }
    }
  }, [src]);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Handlers
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (event) => {
    console.error('❌ Error cargando imagen:', {
      src: optimizedSrc,
      original: src,
      errorEvent: event?.type || 'unknown',
      target: event?.target?.src || 'unknown'
    });
    setIsError(true);
    setIsLoading(false);
    onError?.(event);
  };

  // Error fallback
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
        <div className="text-gray-400 text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Error al cargar imagen</p>
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
      {/* Skeleton loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg">
          <div className="h-full w-full bg-gray-200 rounded-lg"></div>
        </div>
      )}

      {/* Imagen optimizada */}
      {isInView && optimizedSrc && (
        <NextImage
          src={optimizedSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          className={className}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;