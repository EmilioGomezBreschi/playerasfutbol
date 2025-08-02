'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleGlobalSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar en todas las categorías disponibles
      const response = await fetch(`/api/camisas?categorias=JUGADOR,JUGADOR2,RETRO,AFICIONADO 1,AFICIONADO 2&search=${encodeURIComponent(searchTerm)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);
  const categorias = [
    {
      id: 'jugador',
      titulo: 'Camisas de Jugador',
      descripcion: 'Camisas oficiales de calidad premium',
      ruta: '/jugador',
      color: 'blue',
      categorias: ['JUGADOR', 'JUGADOR2'],
      emoji: '⭐',
      disponible: true
    },
    {
      id: 'retro',
      titulo: 'Camisas Retro',
      descripcion: 'Camisas clásicas de temporadas pasadas',
      ruta: '/retro',
      color: 'purple',
      categorias: ['RETRO'],
      emoji: '🏆',
      disponible: true
    },
    {
      id: 'aficionado',
      titulo: 'Camisas de Aficionado',
      descripcion: 'Camisas para fanáticos y uso casual',
      ruta: '/aficionado',
      color: 'green',
      categorias: ['AFICIONADO 1', 'AFICIONADO 2'],
      emoji: '⚽',
      disponible: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Catálogo de</span>{' '}
            <span className="block text-indigo-600 xl:inline">Camisas</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Descubre nuestra colección de camisas de fútbol organizadas por categorías
          </p>

          {/* Barra de búsqueda global */}
          <div className="mt-8 max-w-xl mx-auto">
            <SearchBar
              onSearch={handleGlobalSearch}
              placeholder="Buscar camisas en todo el catálogo..."
              className="w-full"
            />
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {searchResults && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resultados de búsqueda ({searchResults.pagination?.totalCamisas || 0} encontradas)
              </h3>
              {searchResults.camisas?.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {searchResults.camisas.slice(0, 8).map((camisa, index) => (
                    <Link 
                      key={index}
                      href={`/camisa/${encodeURIComponent(camisa.subcategoria)}`}
                      className="group block"
                    >
                      <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <img
                            src={camisa.imageUrl}
                            alt={camisa.subcategoria}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${
                              camisa.categoria === 'RETRO' 
                                ? 'bg-purple-600' 
                                : 'bg-green-600'
                            }`}>
                              {camisa.categoria}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {camisa.subcategoria}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No se encontraron camisas con ese término de búsqueda
                </p>
              )}
              {searchResults.camisas?.length > 8 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Mostrando 8 de {searchResults.pagination.totalCamisas} resultados
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="relative">
              {categoria.disponible ? (
                <Link href={categoria.ruta} className="group block">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    {/* Image placeholder */}
                    <div className={`h-48 bg-gradient-to-r ${
                      categoria.color === 'purple' 
                        ? 'from-purple-500 to-pink-600' 
                        : categoria.color === 'green'
                        ? 'from-green-500 to-teal-600'
                        : 'from-blue-500 to-blue-600'
                    } flex items-center justify-center`}>
                      <div className="text-white text-8xl">
                        {categoria.emoji}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className={`text-xl font-semibold text-gray-900 mb-2 group-hover:text-${categoria.color}-600 transition-colors`}>
                        {categoria.titulo}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {categoria.descripcion}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Ver colección
                        </span>
                        <svg 
                          className={`w-5 h-5 text-${categoria.color}-500 group-hover:translate-x-1 transition-transform`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="group cursor-not-allowed">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden opacity-75">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
                      <div className="text-white text-8xl">
                        {categoria.emoji}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {categoria.titulo}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {categoria.descripcion}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          🔜 Próximamente
                        </span>
                        <svg 
                          className="w-5 h-5 text-gray-400"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Todas las camisas son réplicas de alta calidad
          </p>
        </div>
      </div>
    </div>
  );
}
