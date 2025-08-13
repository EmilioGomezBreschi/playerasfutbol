'use client';

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';
import ImageOptimizer from '../../components/ImageOptimizer';
import ProgressiveImage from '../../components/ProgressiveImage';
import UltraOptimizedImage from '../../components/UltraOptimizedImage';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import ImagePreloader from '../../components/ImagePreloader';

// Hooks personalizados para cookies
const useCookies = () => {
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const setCookie = (name, value, days = 30) => {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  return { getCookie, setCookie };
};

// Hook para gestión de preferencias
const usePreferences = () => {
  const { getCookie, setCookie } = useCookies();
  
  const getPreference = (key, defaultValue) => {
    const saved = getCookie(`jugador_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const setPreference = (key, value) => {
    setCookie(`jugador_${key}`, JSON.stringify(value));
  };

  return { getPreference, setPreference };
};

// Componente de tarjeta memoizado para mejor rendimiento
const CamisaCard = ({ camisa, index }) => {
  const cardRef = useRef();

  return (
    <Link
      ref={cardRef}
      href={`/camisa/${encodeURIComponent(camisa.subcategoria)}`}
      className="group block"
      prefetch={false}
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1">
        {/* Imagen */}
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          <UltraOptimizedImage
            src={camisa.imageUrl}
            alt={camisa.subcategoria}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority={index < 6}
            quality="auto"
            responsive={true}
            cacheStrategy="aggressive"
            preloadStrategy="smart"
          />

          {/* Overlay en hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Badge de categoría */}
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
              {camisa.categoria === "JUGADOR" ? "JUGADOR" : "JUGADOR 2"}
            </span>
          </div>

          {/* Badge de múltiples imágenes */}
          {camisa.totalImagenes > 1 && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 text-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center backdrop-blur-sm shadow-sm">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {camisa.totalImagenes}
              </span>
            </div>
          )}

          {/* Botón Ver más en hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {camisa.subcategoria}
          </h3>
        </div>
      </div>
    </Link>
  );
};

function CamisasJugadorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getPreference, setPreference } = usePreferences();

  // Estados principales
  const [camisas, setCamisas] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estados de búsqueda y paginación con preferencias guardadas
  const [currentPage, setCurrentPage] = useState(() => {
    console.log('🚀 JUGADOR - useState initialization ejecutándose...');
    const urlPage = searchParams.get("page");
    if (urlPage) {
      console.log('📍 JUGADOR - Inicializando desde URL page:', urlPage);
      return parseInt(urlPage);
    }
    
    // Verificar localStorage con timestamp para navegación activa
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('jugador_navigation');
        if (savedData) {
          const { page, timestamp } = JSON.parse(savedData);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000; // 5 minutos
          
          if (now - timestamp < fiveMinutes) {
            console.log('📍 JUGADOR - Inicializando desde localStorage:', page);
            return parseInt(page);
          } else {
            // Limpiar datos antiguos
            localStorage.removeItem('jugador_navigation');
          }
        }
      } catch (e) {
        console.error('Error leyendo localStorage:', e);
        localStorage.removeItem('jugador_navigation');
      }
    }
    
    const cookiePage = getPreference("lastPage", 1);
    console.log('📍 JUGADOR - Inicializando desde cookies/default:', cookiePage);
    return cookiePage;
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    const urlSearch = searchParams.get("search");
    return urlSearch || "";
  });

  // Bandera para detectar primera carga y evitar resetear página al restaurar
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const hasInitialized = useRef(false);

  const [viewMode, setViewMode] = useState(() =>
    getPreference("viewMode", "grid")
  );

  const [itemsPerPage, setItemsPerPage] = useState(() =>
    getPreference("itemsPerPage", 50)
  );

  // Cache para resultados de búsqueda
  const [searchCache, setSearchCache] = useState(new Map());
  const abortControllerRef = useRef();

  // Función optimizada para fetch con cancelación y cache
  const fetchCamisas = useCallback(
    async (page = 1, search = "", useCache = true) => {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      // Generar clave de cache
      const cacheKey = `${page}-${search}-${itemsPerPage}`;

      // Verificar cache
      if (useCache && searchCache.has(cacheKey)) {
        const cachedData = searchCache.get(cacheKey);
        setCamisas(cachedData.camisas);
        setPagination(cachedData.pagination);
        return;
      }

      setLoading(true);
      setIsSearching(!!search);

      try {
        let url = `/api/camisas?categorias=JUGADOR,JUGADOR2&page=${page}&limit=${itemsPerPage}`;
        if (search.trim()) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Error al cargar las camisas");
        }

        const data = await response.json();

        // Guardar en cache (máximo 50 entradas)
        if (searchCache.size >= 50) {
          const firstKey = searchCache.keys().next().value;
          searchCache.delete(firstKey);
        }
        searchCache.set(cacheKey, data);
        setSearchCache(new Map(searchCache));

        setCamisas(data.camisas);
        setPagination(data.pagination);

        // No guardar página en cookies para permitir que sessionStorage funcione
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          console.error("Error fetching camisas:", err);
        }
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [itemsPerPage, setPreference, searchCache]
  );

  // Función de búsqueda optimizada con debouncing
  const handleSearch = useCallback(
    async (search) => {
      console.log('🔍 JUGADOR - handleSearch ejecutándose con:', search);
      const trimmedSearch = search.trim();
      
      // Si no ha cambiado el término de búsqueda, no hacer nada
      if (trimmedSearch === searchTerm) {
        console.log('🚫 JUGADOR - handleSearch ignorado, mismo término:', trimmedSearch);
        return;
      }
      
      setSearchTerm(trimmedSearch);
      
      // Solo resetear página si no es la primera carga (para permitir restauración)
      if (!isFirstLoad) {
        console.log('📄 JUGADOR - handleSearch reseteando página por búsqueda:', trimmedSearch);
        setCurrentPage(1);
      }

      // Actualizar URL sin recargar
      const newUrl = new URL(window.location);
      if (trimmedSearch) {
        newUrl.searchParams.set("search", trimmedSearch);
      } else {
        newUrl.searchParams.delete("search");
      }
      newUrl.searchParams.set("page", "1");

      window.history.replaceState({}, "", newUrl);

      await fetchCamisas(1, trimmedSearch);
    },
    [fetchCamisas, isFirstLoad, searchTerm]
  );

  // Función optimizada de cambio de página
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);

      // Actualizar URL
      const newUrl = new URL(window.location);
      newUrl.searchParams.set("page", page.toString());
      window.history.replaceState({}, "", newUrl);

      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: "smooth" });

      fetchCamisas(page, searchTerm);
    },
    [fetchCamisas, searchTerm]
  );

  // Guardar página actual en localStorage con timestamp para navegación
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔄 JUGADOR - Guardando en localStorage jugador_navigation:', currentPage);
      const navigationData = {
        page: currentPage,
        timestamp: Date.now()
      };
      localStorage.setItem('jugador_navigation', JSON.stringify(navigationData));
    }
  }, [currentPage]);

  // Efecto inicial con cleanup
  useEffect(() => {
    fetchCamisas(currentPage, searchTerm);
    
    // Marcar que ya hemos inicializado después de la primera carga
    setTimeout(() => {
      hasInitialized.current = true;
      setIsFirstLoad(false);
      console.log('✅ JUGADOR - Inicialización completada');
    }, 100);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Efecto para manejar cambios en itemsPerPage
  useEffect(() => {
    setPreference("itemsPerPage", itemsPerPage);
    
    // Si no hemos inicializado completamente, no resetear
    if (!hasInitialized.current) {
      console.log('🚫 JUGADOR - Saltando reset de página, aún inicializando');
      return;
    }
    
    console.log('✅ JUGADOR - Ejecutando reset de página por cambio de itemsPerPage');
    if (currentPage === 1) {
      fetchCamisas(1, searchTerm, false); // No usar cache al cambiar items per page
    } else {
      setCurrentPage(1);
      fetchCamisas(1, searchTerm, false);
    }
  }, [itemsPerPage]);

  // Efecto para manejar cambios en viewMode
  useEffect(() => {
    setPreference("viewMode", viewMode);
  }, [viewMode, setPreference]);

  // Estadísticas memoizadas
  const stats = useMemo(() => {
    if (!pagination.totalCamisas) return null;

    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(
      pagination.currentPage * pagination.limit,
      pagination.totalCamisas
    );

    return { start, end, total: pagination.totalCamisas };
  }, [pagination]);

  // Componente de carga optimizado
  const LoadingComponent = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">
          Cargando camisas de jugador...
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {isSearching ? "Buscando..." : "Cargando contenido..."}
        </p>
      </div>
    </div>
  );

  // Componente de error optimizado
  const ErrorComponent = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Error al cargar
        </h3>
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <div className="space-y-2">
          <button
            onClick={() => {
              setError(null);
              fetchCamisas(currentPage, searchTerm, false);
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading && camisas.length === 0) return <LoadingComponent />;
  if (error) return <ErrorComponent />;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header optimizado */}
      <div className="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                prefetch={true}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver al catálogo
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Camisas de Jugador
              </h1>
            </div>

            <div className="text-sm text-gray-500">
              {stats ? (
                <>
                  Mostrando {stats.start}-{stats.end} de {stats.total} camisas
                  {searchTerm && (
                    <span className="ml-2">• Filtrado por: "{searchTerm}"</span>
                  )}
                </>
              ) : (
                `${camisas.length} camisas disponibles`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-md border border-gray-900 rounded-md shadow-sm">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar camisas retro..."
                className="w-full"
                initialValue={searchTerm}
              />
            </div>

            {/* Controles de vista */}
            <div className="flex items-center space-x-4">
              {/* Items por página */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Por página:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={75}>75</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Modo de vista */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 cursor-pointer"
                  }`}
                  title="Vista en cuadrícula"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700 cursor-pointer"
                  }`}
                  title="Vista en lista"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de carga durante búsqueda */}
      {(loading || isSearching) && camisas.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800 text-sm">
              {isSearching ? "Buscando..." : "Cargando..."}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado vacío */}
        {camisas.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              {searchTerm && (
                <>
                  <p className="text-gray-600 mb-4">
                    No se encontraron camisas de jugador para "{searchTerm}".
                  </p>
                  <button
                    onClick={() => handleSearch("")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Ver todas las camisas
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Grid de Camisas */
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
                : "space-y-4"
            }
          >
            {camisas.map((camisa, index) => (
              <CamisaCard
                key={`${camisa.subcategoria}-${index}`}
                camisa={camisa}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Paginación optimizada */}
        {pagination.totalPages > 1 && (
          <div className="mt-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Navegar por más camisas
                </h3>
                <p className="text-sm text-gray-500">
                  Página {pagination.currentPage} de {pagination.totalPages} •{" "}
                  {pagination.totalCamisas} camisas de jugador disponibles
                  {searchTerm && (
                    <span className="block mt-1">
                      Filtrando por: "
                      <span className="font-medium">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function CamisasJugador() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando camisas...</p>
        </div>
      </div>
    }>
      <CamisasJugadorContent />
    </Suspense>
  );
}