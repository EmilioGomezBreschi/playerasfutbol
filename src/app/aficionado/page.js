'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';

export default function CamisasAficionado() {
  const [camisas, setCamisas] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCamisas = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `/api/camisas?categorias=AFICIONADO 1,AFICIONADO 2&page=${page}&limit=50`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar las camisas');
      }
      const data = await response.json();
      setCamisas(data.camisas);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (search) => {
    setSearchTerm(search);
    setCurrentPage(1); // Resetear a la primera página
    await fetchCamisas(1, search);
  }, [fetchCamisas]);

  useEffect(() => {
    fetchCamisas(currentPage, searchTerm);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba al cambiar página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando camisas de aficionado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <Link href="/" className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al catálogo
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Camisas de Aficionado</h1>
            </div>
            
            <div className="text-sm text-gray-500">
              {pagination.totalCamisas ? (
                <>
                  Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalCamisas)} de {pagination.totalCamisas} camisas
                  {searchTerm && <span className="ml-2">• Filtrado por: "{searchTerm}"</span>}
                </>
              ) : (
                `${camisas.length} camisas disponibles`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda específica */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar camisas de aficionado..."
            className="max-w-md"
            initialValue={searchTerm}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid de Camisas */}
        {camisas.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay camisas disponibles</h3>
              <p className="text-gray-500">Esta categoría está vacía por el momento</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            {camisas.map((camisa, index) => (
              <Link 
                key={index} 
                href={`/camisa/${encodeURIComponent(camisa.subcategoria)}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1">
                  {/* Imagen */}
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                    <Image
                      src={camisa.imageUrl}
                      alt={camisa.subcategoria}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    
                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badge de categoría */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                        {camisa.categoria.replace('AFICIONADO ', 'FAN ')}
                      </span>
                    </div>
                    
                    {/* Badge de múltiples imágenes */}
                    {camisa.totalImagenes > 1 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 text-gray-900 text-xs font-medium px-2 py-1 rounded-full flex items-center backdrop-blur-sm shadow-sm">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          {camisa.totalImagenes}
                        </span>
                      </div>
                    )}

                    {/* Botón Ver más en hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      {camisa.subcategoria}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        Ver galería
                      </span>
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <span>Explorar</span>
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Navegar por más camisas</h3>
                <p className="text-sm text-gray-500">
                  Página {pagination.currentPage} de {pagination.totalPages} • {pagination.totalCamisas} camisas de aficionado disponibles
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