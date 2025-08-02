# 🏆 Camisas de Fútbol - Catálogo Web

Una aplicación web moderna para mostrar y navegar por una colección de camisas de fútbol, organizada por categorías y con visualización de múltiples imágenes por producto.

## 🚀 Características

- **Categorización inteligente**: Las camisas se organizan en tres categorías principales:
  - **Jugador**: Camisas oficiales (JUGADOR y JUGADOR2)
  - **Retro**: Camisas clásicas de temporadas pasadas
  - **Aficionado**: Camisas para fanáticos (AFICIONADO 1 y AFICIONADO 2)

- **Gestión de duplicados**: Agrupa automáticamente las múltiples imágenes de la misma camisa
- **Visualización avanzada**: Galería de imágenes con navegación intuitiva
- **Diseño responsivo**: Optimizado para todos los dispositivos
- **Integración con Cloudinary**: Manejo eficiente de imágenes
- **Base de datos MongoDB**: Almacenamiento robusto de datos

## 🛠️ Tecnologías

- **Frontend**: Next.js 15.4.5 + React 19
- **Estilos**: Tailwind CSS v4
- **Base de datos**: MongoDB con Mongoose
- **Imágenes**: Cloudinary
- **Deployment**: Vercel (recomendado)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   └── camisas/
│   │       ├── route.js                 # API para obtener camisas por categoría
│   │       └── [subcategoria]/
│   │           └── route.js             # API para obtener todas las imágenes de una camisa
│   ├── aficionado/
│   │   └── page.js                      # Página de camisas de aficionado
│   ├── camisa/
│   │   └── [subcategoria]/
│   │       └── page.js                  # Página de detalles de una camisa específica
│   ├── jugador/
│   │   └── page.js                      # Página de camisas de jugador
│   ├── retro/
│   │   └── page.js                      # Página de camisas retro
│   ├── globals.css
│   ├── layout.js
│   └── page.js                          # Página principal con cards de categorías
├── scripts/
│   └── uploadImages.js                  # Script para subir imágenes a Cloudinary
lib/
└── config.js                           # Configuración de MongoDB y Cloudinary
models/
└── Image.js                            # Modelo de datos para las imágenes
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
MONGODB_URI=mongodb://...
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar aplicación en producción
npm start
```

## 🗄️ Estructura de Datos

### Modelo de Imagen

```javascript
{
  categoria: String,      // "JUGADOR", "JUGADOR2", "RETRO", "AFICIONADO 1", "AFICIONADO 2"
  subcategoria: String,   // Nombre específico de la camisa
  imageUrl: String,       // URL de la imagen en Cloudinary
  publicId: String        // ID público de Cloudinary
}
```

## 🔗 Rutas de la Aplicación

- `/` - Página principal con categorías
- `/jugador` - Camisas de jugador (JUGADOR y JUGADOR2)
- `/retro` - Camisas retro
- `/aficionado` - Camisas de aficionado (AFICIONADO 1 y AFICIONADO 2)
- `/camisa/[nombre]` - Detalles de una camisa específica con todas sus imágenes

## 📊 APIs

### GET `/api/camisas?categorias=JUGADOR,JUGADOR2`

Obtiene camisas agrupadas por subcategoría para las categorías especificadas.

**Respuesta:**
```json
[
  {
    "subcategoria": "Nombre de la camisa",
    "categoria": "JUGADOR",
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "...",
    "totalImagenes": 5
  }
]
```

### GET `/api/camisas/[subcategoria]`

Obtiene todas las imágenes de una camisa específica.

**Respuesta:**
```json
{
  "subcategoria": "Nombre de la camisa",
  "categoria": "JUGADOR",
  "images": [
    {
      "imageUrl": "https://res.cloudinary.com/...",
      "publicId": "..."
    }
  ]
}
```

## 🎨 Características de Diseño

- **Colores por categoría**: 
  - Jugador: Índigo
  - Retro: Púrpura
  - Aficionado: Verde
- **Animaciones suaves**: Transiciones en hover y navegación
- **Indicadores visuales**: Badges que muestran categoría y cantidad de imágenes
- **Breadcrumbs**: Navegación contextual en páginas de detalle

## 🚀 Deployment

1. **Vercel** (Recomendado):
   ```bash
   npm run build
   vercel --prod
   ```

2. **Docker**:
   ```bash
   docker build -t camisas-futbol .
   docker run -p 3000:3000 camisas-futbol
   ```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [Next.js](https://nextjs.org/docs)
2. Consulta la documentación de [Cloudinary](https://cloudinary.com/documentation)
3. Abre un issue en este repositorio

---

Construido con ❤️ usando Next.js y Tailwind CSS
