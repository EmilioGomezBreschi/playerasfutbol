"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import SearchBar from "../components/SearchBar";
import ImageOptimizer from "../components/ImageOptimizer";
import ProgressiveImage from "../components/ProgressiveImage";
import { useImagePreloader } from "../hooks/useImagePreloader";
import ImagePreloader from "../components/ImagePreloader";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Hook para precarga de imágenes
  const { preloadCriticalImages } = useImagePreloader();

  // Imágenes críticas para precargar (categorías principales)
  const criticalImages = [
    "/retro.jpeg",
    "/jugador.jpeg", 
    "/aficionado.jpeg",
    "/images/shirtorange.svg",
    "/images/star.svg",
    "/images/heart.svg"
  ];

  // Precarga imágenes críticas al montar el componente
  useEffect(() => {
    preloadCriticalImages(criticalImages);
  }, [preloadCriticalImages]);

  // Cuando searchTerm quede vacío, volvemos al catálogo
  useEffect(() => {
    if (searchTerm === "") {
      setSearchResults(null);
      setAllResults([]);
      setPage(1);
    }
  }, [searchTerm]);

  const fetchPage = useCallback(async (term, pageNum) => {
    const res = await fetch(
      `/api/camisas?categorias=JUGADOR,JUGADOR2,RETRO,AFICIONADO%201,AFICIONADO%202` +
        `&search=${encodeURIComponent(term)}` +
        `&limit=20&page=${pageNum}`
    );
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  }, []);

  const handleGlobalSearch = useCallback(
    async (term) => {
      setSearchTerm(term);
      if (!term.trim()) {
        return; // el useEffect se encargará de resetear
      }
      setIsSearching(true);
      try {
        const data = await fetchPage(term, 1);
        setSearchResults(data);
        setAllResults(data.camisas);
        setPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    },
    [fetchPage]
  );

  const loadMore = useCallback(async () => {
    const next = page + 1;
    setIsSearching(true);
    try {
      const data = await fetchPage(searchTerm, next);
      setAllResults((prev) => [...prev, ...data.camisas]);
      setPage(next);
      setSearchResults((prev) => ({
        ...prev,
        pagination: data.pagination,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, [fetchPage, page, searchTerm]);

  return (
    <>
      {/* Precarga de imágenes críticas */}
      <ImagePreloader images={criticalImages} />
      
      <main className="flex min-h-screen flex-col items-center p-5 pb-10 relative bg-white text-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <a
          href="https://instagram.com/retrojerseys_gdl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Síguenos en Instagram"
        >
          <ImageOptimizer
            src="/ig.svg"
            alt="Instagram"
            width={24}
            height={24}
            priority={true}
            className="w-6 h-6 md:w-7 md:h-7 filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
          />
        </a>
      </div>

      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-4xl font-bold mb-2">Retro Clásicas</h1>
        <p className="text-lg font-light mb-4">
          Camisas históricas y vintage de épocas doradas del fútbol
        </p>
      </div>

      {/* SearchBar siempre visible */}
      <div className="w-full max-w-md mb-8 border rounded-md shadow-md">
        <SearchBar
          onSearch={handleGlobalSearch}
          placeholder="Buscar camisas en todo el catálogo..."
          className="w-full"
        />
      </div>

      {/* Indicador de búsqueda */}
      {isSearching && <p className="text-gray-500 mb-6">Buscando camisas…</p>}

      {/* Si hay resultados de búsqueda */}
      {searchResults ? (
        <div className="w-full max-w-7xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {searchResults.pagination?.totalCamisas || 0} resultados encontrados
          </h3>

          {allResults.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {allResults.map((c, i) => (
                  <Link
                    key={c._id}
                    href={`/camisa/${encodeURIComponent(c.subcategoria)}?page=1`}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <ImageOptimizer
                        src={c.imageUrl}
                        alt={c.subcategoria}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={i < 4}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {c.subcategoria}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{c.categoria}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Botón de cargar más */}
              {searchResults?.pagination?.currentPage <
                searchResults?.pagination?.totalPages && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSearching ? "Cargando..." : "Cargar más resultados"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron resultados</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Volver al catálogo
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Catálogo Principal - Navegación por categorías */}
          <div className="flex md:flex-row flex-col justify-around w-auto md:w-full md:space-x-7 space-y-7 md:space-y-0 grow">
            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/retro?page=1")}
            >
              <div className="flex grow w-full h-48 rounded-t-lg">
                <ProgressiveImage
                  src="/retro.jpeg"
                  alt="Camisas Retro"
                  fill
                  priority={true}
                  className="w-full h-full object-cover md:opacity-70 md:hover:opacity-100 transition-opacity duration-300 ease-out rounded-t-lg"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-4 h-20 flex items-center">
                Camisas Retro
              </h3>
            </button>

            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/jugador?page=1")}
            >
              <div className="flex grow w-full h-48 rounded-t-lg">
                <ProgressiveImage
                  src="/jugador.jpeg"
                  alt="Camisas de Jugador"
                  fill
                  priority={true}
                  className="w-full h-full object-cover md:opacity-70 md:hover:opacity-100 transition-opacity duration-300 ease-out rounded-t-lg"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-4 h-20 flex items-center">
                Camisas de Jugador
              </h3>
            </button>

            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/aficionado?page=1")}
            >
              <div className="flex grow w-full h-48 rounded-t-lg">
                <ProgressiveImage
                  src="/aficionado.jpeg"
                  alt="Camisas de Aficionado"
                  fill
                  priority={true}
                  className="w-full h-full object-cover md:opacity-70 md:hover:opacity-100 transition-opacity duration-300 ease-out rounded-t-lg"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-4 h-20 flex items-center">
                Camisas de Aficionado
              </h3>
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm flex flex-col md:flex-row justify-around w-full space-y-6 md:space-y-0">
            <div className="flex items-center flex-col space-y-3">
              <div className="w-16 h-16 bg-purple-700/70 rounded-full flex justify-center items-center">
                <ImageOptimizer
                  src="/images/shirtorange.svg"
                  alt="Retro Auténticas"
                  width={40}
                  height={40}
                  priority={true}
                  className="opacity-70 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Retro Auténticas
              </h3>
              <p className="text-center text-sm font-bold text-gray-900 px-2">
                Camisas históricas con diseños originales y materiales vintage.
              </p>
            </div>
            <div className="flex items-center flex-col space-y-3">
              <div className="w-16 h-16 bg-blue-900/70 rounded-full flex justify-center items-center">
                <ImageOptimizer
                  src="/images/star.svg"
                  alt="Calidad Jugador"
                  width={40}
                  height={40}
                  priority={true}
                  className="opacity-70 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Calidad Jugador
              </h3>
              <p className="text-center text-sm font-bold text-gray-900 px-2">
                Misma calidad que usan los profesionales en el campo.
              </p>
            </div>
            <div className="flex items-center flex-col space-y-3">
              <div className="w-16 h-16 bg-green-500/70 rounded-full flex justify-center items-center">
                <ImageOptimizer
                  src="/images/heart.svg"
                  alt="Para aficionados"
                  width={40}
                  height={40}
                  priority={true}
                  className="opacity-70 hover:opacity-100 hover:scale-110 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Para aficionados
              </h3>
              <p className="text-center text-sm font-bold text-gray-900 px-2">
                Diseños accesibles sin comprometer el estilo y la comodidad.
              </p>
            </div>
          </footer>
        </>
      )}
      </main>
    </>
  );
}