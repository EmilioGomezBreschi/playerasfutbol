"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleGlobalSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/camisas?categorias=JUGADOR,JUGADOR2,RETRO,AFICIONADO%201,AFICIONADO%202&search=${encodeURIComponent(
          searchTerm
        )}&limit=20`
      );
      if (res.ok) setSearchResults(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-5">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Retro Clásicas</h1>
        <p className="text-lg font-light mb-4">
          Camisas históricas y vintage de épocas doradas del fútbol
        </p>
      </div>

      {/* SearchBar SIEMPRE VISIBLE */}
      <div className="w-full max-w-md mb-8">
        <SearchBar
          onSearch={handleGlobalSearch}
          placeholder="Buscar camisas en todo el catálogo..."
          className="w-full"
        />
      </div>

      {/* Mientras busca */}
      {isSearching && <p className="text-gray-500 mb-6">Buscando camisas…</p>}

      {/* Si hay resultados, muestro sólo la grilla de resultados */}
      {searchResults ? (
        <div className="w-full max-w-7xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-8">
            {searchResults.pagination?.totalCamisas || 0} resultados encontrados
          </h3>
          {searchResults.camisas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-7">
              {searchResults.camisas.map((c, i) => (
                <Link
                  key={i}
                  href={`/camisa/${encodeURIComponent(c.subcategoria)}`}
                  className="group block"
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
        </div>
      ) : (
        <>
          <div className="flex md:flex-row flex-col justify-around w-auto md:w-full md:space-x-7 space-y-7 md:space-y-0 grow">
            <button
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full max-h-80 md:max-h-full overflow-hidden"
              onClick={() => (window.location.href = "/retro")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-red-500/70 hover:bg-red-500 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Playera de Fútbol"
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
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full max-h-80 md:max-h-full overflow-hidden"
              onClick={() => (window.location.href = "/jugador")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-yellow-500/70 hover:bg-yellow-500 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Playera de Fútbol"
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
              className="flex flex-col w-full rounded-lg border cursor-pointer min-h-full max-h-80 md:max-h-full overflow-hidden"
              onClick={() => (window.location.href = "/aficionado")}
            >
              <div className="group flex-1 flex justify-center items-center h-40 rounded-t-lg bg-blue-900/70 hover:bg-blue-900 transition-all duration-300">
                <Image
                  src="/images/shirt.svg"
                  alt="Playera de Fútbol"
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
          <footer className="mt-8 text-center text-sm flex flex-row justify-around w-full">
            <div className="flex items-center flex-col space-y-3">
              <div className="w-15 h-15 bg-red-500/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/shirtorange.svg"
                  alt="Playera de Fútbol"
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
              <div className="w-15 h-15 bg-yellow-500/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/star.svg"
                  alt="Playera de Fútbol"
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
              <div className="w-15 h-15 bg-blue-900/70 rounded-full flex justify-center items-center">
                <Image
                  src="/images/heart.svg"
                  alt="Playera de Fútbol"
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
