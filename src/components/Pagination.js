import { useState, useEffect } from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  const [visiblePages, setVisiblePages] = useState([]);

  useEffect(() => {
    const getVisiblePages = () => {
      const pages = [];
      const maxVisible = 5; // Mostrar máximo 5 números de página

      if (totalPages <= maxVisible) {
        // Si hay pocas páginas, mostrar todas
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Si hay muchas páginas, mostrar las relevantes
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);

        // Ajustar si estamos cerca del inicio
        if (currentPage <= 3) {
          start = 1;
          end = Math.min(5, totalPages);
        }

        // Ajustar si estamos cerca del final
        if (currentPage >= totalPages - 2) {
          start = Math.max(1, totalPages - 4);
          end = totalPages;
        }

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    };

    setVisiblePages(getVisiblePages());
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        ← Anterior
      </button>

      {/* Primera página si no está visible */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-2 text-gray-500">...</span>
          )}
        </>
      )}

      {/* Páginas visibles */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Última página si no está visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-2 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Siguiente →
      </button>
    </div>
  );
} 