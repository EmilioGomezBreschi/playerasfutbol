import { NextResponse } from 'next/server';
import Camisa from '../../../../models/Camisa.js';
import '../../../../lib/config.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorias = searchParams.get('categorias')?.split(',') || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // 50 camisas por página por defecto
    const search = searchParams.get('search') || '';
    
    if (categorias.length === 0) {
      return NextResponse.json({ error: 'Categorías requeridas' }, { status: 400 });
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Construir query de búsqueda
    let query = { categoria: { $in: categorias } };
    
    // Agregar filtro de búsqueda si existe
    if (search.trim()) {
      query.subcategoria = { 
        $regex: search.trim(), 
        $options: 'i' // Case insensitive
      };
    }

    // Contar total de camisas para la paginación
    const totalCamisas = await Camisa.countDocuments(query);

    // Buscar camisas por categorías especificadas con paginación
    const camisas = await Camisa.find(query)
    .select('categoria subcategoria imagenes totalImagenes fechaCreacion')
    .sort({ subcategoria: 1 })
    .skip(skip)
    .limit(limit);

    // Formatear respuesta para compatibilidad con el frontend
    const camisasFormateadas = camisas.map(camisa => {
      const imagenPrincipal = camisa.getImagenPrincipal();
      
      return {
        categoria: camisa.categoria,
        subcategoria: camisa.subcategoria,
        imageUrl: imagenPrincipal?.imageUrl || '',
        publicId: imagenPrincipal?.publicId || '',
        totalImagenes: camisa.totalImagenes,
        fechaCreacion: camisa.fechaCreacion
      };
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCamisas / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      camisas: camisasFormateadas,
      pagination: {
        currentPage: page,
        totalPages,
        totalCamisas,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error obteniendo camisas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 