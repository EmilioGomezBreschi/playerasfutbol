import { NextResponse } from 'next/server';
import Camisa from '../../../../models/Camisa.js';
import '../../../../lib/config.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorias = searchParams.get('categorias')?.split(',') || [];
    
    if (categorias.length === 0) {
      return NextResponse.json({ error: 'Categorías requeridas' }, { status: 400 });
    }

    // Buscar camisas por categorías especificadas
    const camisas = await Camisa.find({ 
      categoria: { $in: categorias } 
    })
    .select('categoria subcategoria imagenes totalImagenes fechaCreacion')
    .sort({ subcategoria: 1 });

    // Formatear respuesta para compatibilidad con el frontend
    const camisasFormateadas = camisas.map(camisa => {
      const imagenPrincipal = camisa.getImagenPrincipal();
      
      return {
        categoria: camisa.categoria,
        subcategoria: camisa.subcategoria,
        imageUrl: imagenPrincipal?.imageUrl || '',
        publicId: imagenPrincipal?.publicId || '',
        totalImagenes: camisa.totalImagenes,
        fechaCreacion: camisa.fechaCreacion,
        // Incluir todas las imágenes para referencia
        imagenes: camisa.imagenes
      };
    });

    return NextResponse.json(camisasFormateadas);
  } catch (error) {
    console.error('Error obteniendo camisas optimizadas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 