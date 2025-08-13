import React from 'react';

// Componente de skeleton loading para imágenes
const ImageSkeleton = ({ 
  className = "", 
  width = "100%", 
  height = "100%", 
  rounded = "rounded-lg",
  animate = true 
}) => {
  return (
    <div 
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
        ${rounded} 
        ${animate ? 'animate-pulse' : ''} 
        ${className}
      `}
      style={{ 
        width, 
        height,
        backgroundSize: '200% 100%',
        animation: animate ? 'shimmer 1.5s infinite' : 'none'
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Skeleton para grid de imágenes
export const ImageGridSkeleton = ({ 
  count = 8, 
  columns = 4, 
  className = "" 
}) => {
  return (
    <div className={`grid gap-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns} m-7 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="aspect-square relative">
            <ImageSkeleton className="w-full h-full" />
          </div>
          <div className="p-3">
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton para tarjeta individual
export const ImageCardSkeleton = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <ImageSkeleton className="w-full h-full" />
      </div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
  );
};

// Skeleton para hero/banner
export const HeroSkeleton = ({ className = "" }) => {
  return (
    <div className={`w-full h-64 md:h-96 relative ${className}`}>
      <ImageSkeleton className="w-full h-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 bg-white/80 rounded mb-2 animate-pulse w-48 mx-auto"></div>
          <div className="h-4 bg-white/80 rounded w-64 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageSkeleton;
