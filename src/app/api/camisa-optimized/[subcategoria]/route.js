import { NextResponse } from 'next/server';
import Camisa from '../../../../models/Camisa.js';
import '../../../../lib/config.js';

export async function GET(request, { params }) {
  try {
    // En Next.js 15, params debe ser await-ed
    const { subcategoria } = await params;
    
    if (!subcategoria) {
      return NextResponse.json({ error: 'Subcategoría requerida' }, { status: 400 });
    }

    // Decodificar la subcategoría en caso de que tenga caracteres especiales
    const decodedSubcategoria = decodeURIComponent(subcategoria);

    // Buscar la camisa específica
    const camisa = await Camisa.findOne({ 
      subcategoria: decodedSubcategoria 
    });

    if (!camisa) {
      return NextResponse.json({ error: 'No se encontró la camisa' }, { status: 404 });
    }

    // Formatear respuesta
    const response = {
      categoria: camisa.categoria,
      subcategoria: camisa.subcategoria,
      totalImagenes: camisa.totalImagenes,
      fechaCreacion: camisa.fechaCreacion,
      fechaActualizacion: camisa.fechaActualizacion,
      // Todas las imágenes de la camisa
      images: camisa.imagenes.map((img, index) => ({
        imageUrl: img.imageUrl,
        publicId: img.publicId,
        fileName: img.fileName,
        index: index
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo detalles de la camisa:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 