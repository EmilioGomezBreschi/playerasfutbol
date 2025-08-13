"use client";

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
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
