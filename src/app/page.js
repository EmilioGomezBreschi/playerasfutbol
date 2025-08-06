"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

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
    <main className="flex min-h-screen flex-col items-center p-5 pb-10 relative">
      <div className="fixed top-4 right-4 z-50">
        <a
          href="https://instagram.com/retrojerseys_gdl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Síguenos en Instagram"
        >
          <Image
            src="/ig.svg"
            alt="Instagram"
            width={24}
            height={24}
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
            <div className="grid gap-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-7">
              {allResults.map((c, i) => (
                <Link
                  key={i}
                  href={`/camisa/${encodeURIComponent(c.subcategoria)}`}
                  className="group block mb-6"
                >
                  <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative">
                      <img
                        src={c.imageUrl}
                        alt={c.subcategoria}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full text-white ${
                          c.categoria === "RETRO"
                            ? "bg-purple-600"
                            : c.categoria === "JUGADOR" ||
                              c.categoria === "JUGADOR2"
                            ? "bg-blue-600"
                            : "bg-green-600"
                        }`}
                      >
                        {c.categoria}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {c.subcategoria}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No se encontraron camisas
            </p>
          )}

          {/* Botón “Cargar más” */}
          {allResults.length < searchResults.pagination.totalCamisas && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {isSearching ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Botones de categoría */}
          <div className="flex md:flex-row flex-col justify-around w-auto md:w-full md:space-x-7 space-y-7 md:space-y-0 grow">
            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/retro")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-purple-700/70 hover:bg-purple-700 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Camisas Retro"
                  width={100}
                  height={100}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-4 h-20 flex items-center">
                Camisas Retro
              </h3>
            </button>

            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/jugador")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-blue-900/70 hover:bg-blue-900 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Camisas de Jugador"
                  width={100}
                  height={100}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-7">
                Camisas de Jugador
              </h3>
            </button>

            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-80 overflow-hidden"
              onClick={() => (window.location.href = "/aficionado")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-green-500/70 hover:bg-green-500 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Camisas de Aficionado"
                  width={100}
                  height={100}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-start text-sm font-bold p-7">
                Camisas de Aficionado
              </h3>
            </button>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm flex flex-row justify-around w-full">
            <div className="flex items-center flex-col space-y-3">
              <div className="w-15 h-15 bg-purple-700/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/shirtorange.svg"
                  alt="Retro Auténticas"
                  width={40}
                  height={40}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Retro Auténticas
              </h3>
              <p className="text-center text-sm font-bold text-gray-900">
                Camisas históricas con diseños originales y materiales vintage.
              </p>
            </div>
            <div className="flex items-center flex-col space-y-3">
              <div className="w-15 h-15 bg-blue-900/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/star.svg"
                  alt="Calidad Jugador"
                  width={40}
                  height={40}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Calidad Jugador
              </h3>
              <p className="text-center text-sm font-bold text-gray-900">
                Misma calidad que usan los profesionales en el campo.
              </p>
            </div>
            <div className="flex items-center flex-col space-y-3">
              <div className="w-15 h-15 bg-green-500/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/heart.svg"
                  alt="Para aficionados"
                  width={40}
                  height={40}
                  className="opacity-70 group-hover:opacity-100 group-hover:scale-115 transition-transform duration-300 ease-out"
                />
              </div>
              <h3 className="text-center text-base font-extrabold">
                Para aficionados
              </h3>
              <p className="text-center text-sm font-bold text-gray-900">
                Diseños accesibles sin comprometer el estilo y la comodidad.
              </p>
            </div>
          </footer>
        </>
      )}
    </main>
  );
}
