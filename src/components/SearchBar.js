import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Buscar camisas...",
  className = "",
  initialValue = "",
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  // Cada vez que cambie initialValue desde el padre, sincronizamos
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const triggerSearch = async (term) => {
    setIsSearching(true);
    try {
      await onSearch(term);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para tipeo normal
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerSearch(searchTerm);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    triggerSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    // Disparamos YA la búsqueda vacía
    triggerSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="relative">
          {/* Icono de lupa */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={`h-5 w-5 ${
                isSearching ? "text-blue-500 animate-pulse" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                       transition-all"
          />

          {/* Botón de limpiar */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
