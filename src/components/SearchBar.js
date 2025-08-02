import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ 
  onSearch, 
  placeholder = "Buscar camisas...", 
  className = "",
  initialValue = ""
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async (value) => {
    setIsSearching(true);
    try {
      await onSearch(value);
    } finally {
      setIsSearching(false);
    }
  };

  // Efecto para manejar el debounce
  useEffect(() => {
    // Limpiar el timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // No buscar si está vacío y es el valor inicial
    if (searchTerm === initialValue && searchTerm === '') {
      return;
    }

    // Configurar nuevo timeout
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        setIsSearching(true);
        onSearch(searchTerm).finally(() => {
          setIsSearching(false);
        });
      }
    }, 500); // 500ms para mejor UX

    // Cleanup al desmontar
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, onSearch]); // Dependencias necesarias

  const handleSubmit = (e) => {
    e.preventDefault();
    // Limpiar debounce y buscar inmediatamente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    handleSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    // La búsqueda se ejecutará automáticamente por el useEffect
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // El debounce se maneja automáticamente por useEffect
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className={`h-5 w-5 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input de búsqueda */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />

          {/* Botón de limpiar */}
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Indicador de carga */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </form>

      {/* Resultados sugeridos o mensajes */}
      {searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-3 text-sm text-gray-600">
            Buscando: "<span className="font-medium text-gray-900">{searchTerm}</span>"
          </div>
        </div>
      )}
    </div>
  );
} 