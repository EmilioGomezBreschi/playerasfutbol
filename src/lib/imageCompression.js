// Servicio de compresión de imágenes en el cliente
class ImageCompressionService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  }

  // Inicializa el canvas para compresión
  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Comprime una imagen
  async compressImage(file, options = {}) {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Archivo no válido'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const compressedBlob = this.compressImageData(img, maxWidth, maxHeight, quality, format);
          resolve(compressedBlob);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Comprime datos de imagen
  compressImageData(img, maxWidth, maxHeight, quality, format) {
    this.initCanvas();

    // Calcular nuevas dimensiones manteniendo aspect ratio
    const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
    
    this.canvas.width = width;
    this.canvas.height = height;

    // Limpiar canvas
    this.ctx.clearRect(0, 0, width, height);

    // Dibujar imagen redimensionada
    this.ctx.drawImage(img, 0, 0, width, height);

    // Convertir a blob comprimido
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, format, quality);
    });
  }

  // Calcula dimensiones manteniendo aspect ratio
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  // Optimiza una imagen existente (URL)
  async optimizeImageFromUrl(imageUrl, options = {}) {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          this.initCanvas();
          
          const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
          
          this.canvas.width = width;
          this.canvas.height = height;
          
          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(img, 0, 0, width, height);
          
          this.canvas.toBlob(resolve, format, quality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Error al cargar imagen desde URL'));
      img.src = imageUrl;
    });
  }

  // Convierte blob a base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convierte base64 a blob
  async base64ToBlob(base64, mimeType = 'image/jpeg') {
    const response = await fetch(base64);
    return response.blob();
  }

  // Optimiza múltiples imágenes
  async optimizeMultipleImages(imageUrls, options = {}) {
    const promises = imageUrls.map(url => 
      this.optimizeImageFromUrl(url, options).catch(error => {
        console.warn(`Error optimizando imagen ${url}:`, error);
        return null; // Retorna null para imágenes que fallan
      })
    );

    const results = await Promise.allSettled(promises);
    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);
  }

  // Crea thumbnail de imagen
  async createThumbnail(imageUrl, size = 150, quality = 0.7) {
    return this.optimizeImageFromUrl(imageUrl, {
      maxWidth: size,
      maxHeight: size,
      quality,
      format: 'image/jpeg'
    });
  }

  // Verifica si el navegador soporta WebP
  supportsWebP() {
    return this.supportedFormats.includes('image/webp');
  }

  // Obtiene el mejor formato disponible
  getBestFormat() {
    if (this.supportsWebP()) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }

  // Limpia recursos
  cleanup() {
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = null;
      this.ctx = null;
    }
  }
}

// Instancia singleton
const imageCompressionService = new ImageCompressionService();

export default imageCompressionService;
