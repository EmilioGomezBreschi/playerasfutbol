'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DetalleCamisa() {
  const { subcategoria } = useParams();
  const router = useRouter();
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

  const handleWhatsAppContact = () => {
    if (!data) return;
    
    const telefono = '+523313370374';
    const mensaje = `Hola! Me interesa la camisa ${data.subcategoria} de la categoría ${data.categoria}. ¿Podrías darme más información sobre disponibilidad y precios?`;
    const url = `https://wa.me/${telefono.replace('+', '')}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
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
    <div className="min-h-screen bg-white py-8 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex space-x-2 text-sm text-gray-500 mb-4">
            <Link
              href="/"
              className={`hover:text-${colorClasses}-600`}
            >
              Inicio
            </Link>
            <span>/</span>
            <Link
              href={rutaCategoria}
              className={`hover:text-${colorClasses}-600`}
            >
              {data.categoria === "RETRO" ? "Retro" : "Aficionado"}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {data.subcategoria}
            </span>
          </nav>

          <Link
            href={rutaCategoria}
            className={`inline-flex items-center text-${colorClasses}-600 hover:text-${colorClasses}-800 mb-4`}
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
                {data.images.map((imagen, index) => {
                  const isSelected = index === imagenSeleccionada;
                  return (
                    <button
                      key={index}
                      onClick={() => setImagenSeleccionada(index)}
                      className={`
            relative
            aspect-square
            overflow-hidden
            rounded-md
            border-2
            transform
            transition-all
            ${
              isSelected
                ? "scale-110 z-10 border-" + colorClasses + "-500"
                : "border-gray-200 hover:scale-105 cursor-pointer hover:z-20 hover:border-gray-300"
            }
          `}
                    >
                      <Image
                        src={imagen.imageUrl}
                        alt={`${data.subcategoria} - Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <div
                className={`inline-block bg-${colorClasses}-100 text-${colorClasses}-800 text-xs px-3 py-1 rounded-full font-medium mb-3`}
              >
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles del producto
              </h3>
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
              <button
                onClick={handleWhatsAppContact}
                className={`w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.690z" />
                </svg>
                <span>Contactar para más información</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 