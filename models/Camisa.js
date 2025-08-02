import mongoose from "mongoose";

const CamisaSchema = new mongoose.Schema({
  categoria: { 
    type: String, 
    required: true,
    index: true // Índice para consultas por categoría
  },
  subcategoria: { 
    type: String, 
    required: true,
    index: true // Índice para consultas por subcategoría
  },
  imagenes: [{
    imageUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    fileName: String // Nombre original del archivo
  }],
  totalImagenes: {
    type: Number,
    default: function() {
      return this.imagenes.length;
    }
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para consultas combinadas
CamisaSchema.index({ categoria: 1, subcategoria: 1 }, { unique: true });

// Middleware para actualizar fechaActualizacion y totalImagenes
CamisaSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  this.totalImagenes = this.imagenes.length;
  next();
});

// Método para agregar una imagen
CamisaSchema.methods.agregarImagen = function(imageUrl, publicId, fileName) {
  this.imagenes.push({ imageUrl, publicId, fileName });
  this.totalImagenes = this.imagenes.length;
  return this;
};

// Método para obtener la imagen principal
CamisaSchema.methods.getImagenPrincipal = function() {
  if (this.imagenes.length === 0) {
    return null;
  }
  
  // Para camisas RETRO, JUGADOR y JUGADOR2, usar la penúltima imagen como principal
  if (this.categoria === 'RETRO' || this.categoria === 'JUGADOR' || this.categoria === 'JUGADOR2') {
    // Si hay al menos 2 imágenes, devolver la penúltima
    if (this.imagenes.length >= 2) {
      return this.imagenes[this.imagenes.length - 2];
    }
    // Si solo hay una imagen, devolverla
    return this.imagenes[0];
  }
  
  // Para otras categorías, usar la primera imagen
  return this.imagenes[0];
};

export default mongoose.models.Camisa || mongoose.model("Camisa", CamisaSchema); 