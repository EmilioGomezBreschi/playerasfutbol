"use client";

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    // Limpiar cualquier Service Worker existente
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('🧹 Service Worker desregistrado exitosamente');
            }
          });
        }
      });
      
      // Limpiar caches del Service Worker
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('🗑️ Eliminando cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        });
      }
    }
    return;
    
    // CÓDIGO ORIGINAL COMENTADO:
    if (false && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado exitosamente:', registration);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nueva versión disponible
                console.log('Nueva versión disponible');
                
                // Opcional: mostrar notificación al usuario
                if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });

      // Limpiar cache antiguo periódicamente
      setInterval(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAN_CACHE' });
        }
      }, 24 * 60 * 60 * 1000); // Cada 24 horas
    }
  }, []);

  return null; // Este componente no renderiza nada
};

export default ServiceWorkerRegistration;
