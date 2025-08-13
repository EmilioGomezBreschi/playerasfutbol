# Optimización de Imágenes - Proyecto Camisas

## 🚀 Estrategias Implementadas

### 1. **Precarga Inteligente de Imágenes**
- **Componente `ImagePreloader`**: Precarga imágenes críticas en el `<head>` del documento
- **Hook `useImagePreloader`**: Precarga programática de imágenes con límite de concurrencia
- **Precarga basada en scroll**: Detecta cuando las imágenes están próximas a ser visibles

### 2. **Componente `ImageOptimizer`**
- **Lazy loading inteligente**: Usa Intersection Observer para cargar imágenes solo cuando son necesarias
- **Skeleton loading**: Muestra placeholders animados mientras cargan las imágenes
- **Fallback automático**: Maneja errores de carga con imágenes de respaldo
- **Transiciones suaves**: Fade-in de imágenes cuando terminan de cargar

### 3. **Service Worker para Cache Offline**
- **Cache agresivo**: Almacena imágenes en cache del navegador por 1 año
- **Estrategia cache-first**: Prioriza imágenes en cache sobre descargas de red
- **Fallback offline**: Muestra placeholders cuando no hay conexión
- **Limpieza automática**: Elimina cache antiguo periódicamente

### 4. **Headers de Cache Optimizados**
- **Archivo `_headers`**: Configuración para Netlify y otros servicios
- **Cache inmutable**: Las imágenes no se revalidan hasta que expiran
- **Compresión gzip**: Reduce el tamaño de archivos CSS/JS
- **Headers de seguridad**: Protección contra ataques XSS y clickjacking

### 5. **Compresión de Imágenes en Cliente**
- **Servicio `imageCompression`**: Comprime imágenes usando Canvas API
- **Formatos optimizados**: Soporte para WebP cuando está disponible
- **Thumbnails automáticos**: Genera versiones pequeñas para previews
- **Lotes de procesamiento**: Procesa múltiples imágenes sin bloquear la UI

## 📁 Archivos Creados/Modificados

### Nuevos Componentes:
- `src/components/ImageOptimizer.js` - Componente principal de optimización
- `src/components/ImageSkeleton.js` - Skeleton loading para imágenes
- `src/components/ImagePreloader.js` - Precarga de imágenes críticas
- `src/components/ServiceWorkerRegistration.js` - Registro del service worker

### Nuevos Hooks:
- `src/hooks/useImagePreloader.js` - Hook para precarga programática

### Nuevos Servicios:
- `src/lib/imageCompression.js` - Compresión de imágenes en cliente

### Archivos de Configuración:
- `public/_headers` - Headers de cache para hosting
- `public/sw.js` - Service worker para cache offline
- `next.config.mjs` - Configuración optimizada de Next.js

## 🎯 Cómo Usar

### 1. **Reemplazar `<Image>` con `<ImageOptimizer>`**
```jsx
// Antes
<Image src={imageUrl} alt="Descripción" fill />

// Después
<ImageOptimizer 
  src={imageUrl} 
  alt="Descripción" 
  fill 
  priority={index < 8} // Prioridad para primeras imágenes
/>
```

### 2. **Precargar Imágenes Críticas**
```jsx
import { useImagePreloader } from '../hooks/useImagePreloader';

const { preloadCriticalImages } = useImagePreloader();

useEffect(() => {
  preloadCriticalImages(['/imagen1.jpg', '/imagen2.jpg']);
}, []);
```

### 3. **Usar Skeleton Loading**
```jsx
import { ImageGridSkeleton } from '../components/ImageSkeleton';

// Mientras cargan las imágenes
{isLoading && <ImageGridSkeleton count={8} columns={4} />}
```

## 📊 Beneficios Esperados

### **Velocidad de Carga:**
- ⚡ **30-50% más rápido** en cargas iniciales
- 🚀 **Lazy loading inteligente** reduce requests innecesarios
- 💾 **Cache agresivo** mejora navegación posterior

### **Experiencia de Usuario:**
- 🎨 **Skeleton loading** elimina saltos de layout
- 🔄 **Transiciones suaves** entre estados de carga
- 📱 **Mejor rendimiento** en dispositivos móviles

### **SEO y Core Web Vitals:**
- 📈 **LCP mejorado** (Largest Contentful Paint)
- 📉 **CLS reducido** (Cumulative Layout Shift)
- 🎯 **FID optimizado** (First Input Delay)

## 🔧 Configuración del Hosting

### **Netlify:**
El archivo `_headers` se aplica automáticamente.

### **Vercel:**
Los headers están configurados en `next.config.mjs`.

### **Otros Servicios:**
Configura manualmente los headers de cache según tu hosting.

## 🚨 Consideraciones Importantes

### **Tamaño del Bundle:**
- Los nuevos componentes agregan ~15-20KB al bundle
- El service worker es ~8KB
- **Total**: ~25KB adicionales

### **Compatibilidad del Navegador:**
- **Service Worker**: IE11+, Safari 11.1+
- **Intersection Observer**: IE11+ (con polyfill)
- **Canvas API**: IE9+

### **Memoria:**
- El cache de imágenes puede usar 50-100MB en dispositivos
- Se limpia automáticamente cada 24 horas
- Los usuarios pueden limpiar manualmente desde DevTools

## 🔄 Mantenimiento

### **Actualizar Cache:**
```bash
# Cambiar versión en sw.js
const CACHE_NAME = 'camisas-cache-v2';
```

### **Limpiar Cache Manualmente:**
```javascript
// En consola del navegador
navigator.serviceWorker.controller.postMessage({ type: 'CLEAN_CACHE' });
```

### **Monitorear Rendimiento:**
- Usar Lighthouse para medir mejoras
- Revisar Network tab en DevTools
- Monitorear Core Web Vitals en Google Search Console

## 📚 Recursos Adicionales

- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Nota**: Estas optimizaciones están diseñadas para funcionar sin tokens de Vercel y mejorar significativamente el rendimiento de carga de imágenes.
