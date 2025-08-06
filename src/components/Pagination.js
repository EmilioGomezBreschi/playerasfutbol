import { useState, useEffect } from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  const [visiblePages, setVisiblePages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Efecto para detectar cambios de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const getVisiblePages = () => {
      const pages = [];
      // Responsivo: 3 en móvil, 5 en desktop
      const maxVisible = isMobile ? 3 : 5;

      if (totalPages <= maxVisible) {
        // Si hay pocas páginas, mostrar todas
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Si hay muchas páginas, mostrar las relevantes
        const halfVisible = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - halfVisible);
        let end = Math.min(totalPages, currentPage + halfVisible);

        // Ajustar si estamos cerca del inicio
        if (currentPage <= halfVisible + 1) {
          start = 1;
          end = Math.min(maxVisible, totalPages);
        }

        // Ajustar si estamos cerca del final
        if (currentPage >= totalPages - halfVisible) {
          start = Math.max(1, totalPages - maxVisible + 1);
          end = totalPages;
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    };

    setVisiblePages(getVisiblePages());
  }, [currentPage, totalPages, isMobile]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 flex-wrap px-2 ${className}`}>
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-200 hover:text-indigo-600"
        }`}
      >
        <span className="hidden sm:inline">← Anterior</span>
        <span className="sm:hidden">←</span>
      </button>

      {/* Primera página si no está visible */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 min-w-0 flex-shrink-0"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-1 sm:px-2 py-2 text-gray-500 text-xs sm:text-sm">...</span>
          )}
        </>
      )}

      {/* Páginas visibles */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
            page === currentPage
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200 hover:text-indigo-600 cursor-pointer"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Última página si no está visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-1 sm:px-2 py-2 text-gray-500 text-xs sm:text-sm">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:text-indigo-600 hover:bg-gray-200 cursor-pointer min-w-0 flex-shrink-0"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-w-0 flex-shrink-0 ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 cursor-pointer border border-gray-300 hover:bg-gray-200 hover:text-indigo-600"
        }`}
      >
        <span className="hidden sm:inline">Siguiente →</span>
        <span className="sm:hidden">→</span>
      </button>
    </div>
  );
} 