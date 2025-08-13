"use client";

import { useEffect } from 'react';
import Head from 'next/head';

// Componente para precargar imágenes críticas
const ImagePreloader = ({ images = [] }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return;

    // Precarga imágenes críticas
    const preloadImages = () => {
      images.forEach((imageUrl, index) => {
        // Solo precargar las primeras 4 imágenes para no sobrecargar
        if (index < 4) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = imageUrl;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);

          // También precargar con Image API para cache del navegador
          const img = new Image();
          img.src = imageUrl;
        }
      });
    };

    // Precarga diferida para no bloquear el render inicial
    const timer = setTimeout(preloadImages, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [images]);

  return (
    <Head>
      {/* Preload de imágenes críticas */}
      {images.slice(0, 4).map((imageUrl, index) => (
        <link
          key={index}
          rel="preload"
          as="image"
          href={imageUrl}
          crossOrigin="anonymous"
        />
      ))}
      
      {/* DNS prefetch para dominios de imágenes */}
      <link rel="dns-prefetch" href="//res.cloudinary.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      
      {/* Preconnect para conexiones rápidas */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
    </Head>
  );
};

// Hook para precarga programática
export const useCriticalImagePreloader = (imageUrls) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !imageUrls || imageUrls.length === 0) return;

    const criticalImages = imageUrls.slice(0, 6); // Primeras 6 imágenes
    
    // Precarga con prioridad alta
    criticalImages.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Limpiar al desmontar
    return () => {
      const links = document.querySelectorAll('link[rel="preload"][as="image"]');
      links.forEach(link => {
        if (criticalImages.includes(link.href)) {
          link.remove();
        }
      });
    };
  }, [imageUrls]);
};

// Componente para precarga de imágenes de fondo
export const BackgroundImagePreloader = ({ images = [] }) => {
  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return;

    // Precarga imágenes de fondo con menor prioridad
    const preloadBackgroundImages = () => {
      images.forEach((imageUrl) => {
        const img = new Image();
        img.src = imageUrl;
      });
    };

    // Precarga después de que la página esté cargada
    if (document.readyState === 'complete') {
      preloadBackgroundImages();
    } else {
      window.addEventListener('load', preloadBackgroundImages);
      return () => window.removeEventListener('load', preloadBackgroundImages);
    }
  }, [images]);

  return null;
};

export default ImagePreloader;
