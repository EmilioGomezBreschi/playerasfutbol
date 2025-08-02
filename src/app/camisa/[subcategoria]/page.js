'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DetalleCamisa() {
  const { subcategoria } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  useEffect(() => {
    if (!subcategoria) return;

    const fetchDetalles = async () => {
      try {
        const response = await fetch(`/api/camisa/${encodeURIComponent(subcategoria)}`);
        if (!response.ok) {
          throw new Error('Error al cargar los detalles de la camisa');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalles();
  }, [subcategoria]);

  const getCategoriaColor = (categoria) => {
    switch (categoria) {
      case 'RETRO':
        return 'purple';
      case 'AFICIONADO 1':
      case 'AFICIONADO 2':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getCategoriaRuta = (categoria) => {
    switch (categoria) {
      case 'RETRO':
        return '/retro';
      case 'AFICIONADO 1':
      case 'AFICIONADO 2':
        return '/aficionado';
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <Link href="/" className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No se encontraron datos</p>
          <Link href="/" className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const colorClasses = getCategoriaColor(data.categoria);
  const rutaCategoria = getCategoriaRuta(data.categoria);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className={`hover:text-${colorClasses}-600`}>Inicio</Link>
            <span>/</span>
            <Link href={rutaCategoria} className={`hover:text-${colorClasses}-600`}>
              {data.categoria === 'RETRO' ? 'Retro' : 'Aficionado'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{data.subcategoria}</span>
          </nav>

          <Link href={rutaCategoria} className={`inline-flex items-center text-${colorClasses}-600 hover:text-${colorClasses}-800 mb-4`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la categoría
          </Link>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Imagen Principal */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-lg">
              <Image
                src={data.images[imagenSeleccionada].imageUrl}
                alt={`${data.subcategoria} - Imagen ${imagenSeleccionada + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Miniaturas */}
            {data.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {data.images.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenSeleccionada(index)}
                    className={`aspect-square relative overflow-hidden rounded-md border-2 transition-all ${
                      index === imagenSeleccionada 
                        ? `border-${colorClasses}-500` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={imagen.imageUrl}
                      alt={`${data.subcategoria} - Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <div className={`inline-block bg-${colorClasses}-100 text-${colorClasses}-800 text-xs px-3 py-1 rounded-full font-medium mb-3`}>
                {data.categoria}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {data.subcategoria}
              </h1>
              <p className="text-gray-600">
                Camisa de fútbol de alta calidad - Réplica oficial
              </p>
            </div>

            {/* Información adicional */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del producto</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Categoría:</span>
                  <span className="font-medium">{data.categoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modelo:</span>
                  <span className="font-medium">{data.subcategoria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total de imágenes:</span>
                  <span className="font-medium">{data.images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Material:</span>
                  <span className="font-medium">Poliéster de alta calidad</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium">Réplica oficial</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="border-t pt-6">
              <div className="space-y-3">
                <button className={`w-full bg-${colorClasses}-600 text-white py-3 px-6 rounded-md hover:bg-${colorClasses}-700 transition-colors font-medium`}>
                  Contactar para más información
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors font-medium">
                  Compartir producto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Galería completa */}
        {data.images.length > 1 && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las imágenes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.images.map((imagen, index) => (
                <button
                  key={index}
                  onClick={() => setImagenSeleccionada(index)}
                  className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all ${
                    index === imagenSeleccionada 
                      ? `border-${colorClasses}-500 scale-105` 
                      : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                  }`}
                >
                  <Image
                    src={imagen.imageUrl}
                    alt={`${data.subcategoria} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 