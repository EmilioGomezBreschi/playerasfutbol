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

  // Optimización experimental (solo las válidas)
  experimental: {
    // Optimizar bundle
    optimizePackageImports: ["mongoose", "cloudinary"],
    // Optimización de imágenes
    optimizeCss: true,
    // Optimización de fuentes
    fontLoaders: [
      { loader: '@next/font/google', options: { subsets: ['latin'] } }
    ],
  },

  // Configuración de producción
  ...(process.env.NODE_ENV === "production" && {
    poweredByHeader: false,
    generateEtags: false,
    compress: true,
    // Optimización de headers
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
        {
          source: '/images/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/(.*).(jpg|jpeg|png|gif|svg|webp)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
  }),

  // Optimización de webpack
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimización para producción
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          images: {
            test: /[\\/]public[\\/]images[\\/]/,
            name: 'images',
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
