/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Optimizaciones adicionales de imágenes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // 24 horas de cache
    // Configuración para móviles problemáticos
    unoptimized: true,

    // Configuración específica para móviles
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimización del compilador
  compiler: {
    // Remover console.log en producción
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  // Configuración de producción
  ...(process.env.NODE_ENV === "production" && {
    poweredByHeader: false,
    generateEtags: false,
    compress: true,
  }),
};

export default nextConfig;
