import fs from "fs";
import path from "path";
import { cloudinary } from "../../lib/config.js";
import Camisa from "../../models/Camisa.js";

// Ruta absoluta a las imágenes externas
const baseFolder = "C:/Users/hhdcv/Desktop/proyectos/scraping-python/imagenes";

// Función para limpiar nombres de archivos y carpetas
function limpiarNombre(nombre) {
  return nombre.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
}

// Función para verificar si es un archivo de imagen válido
function esImagenValida(fileName) {
  const extensionesValidas = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  return extensionesValidas.some(ext => 
    fileName.toLowerCase().endsWith(ext)
  );
}

async function uploadCamisasOptimizadas() {
  console.log('🚀 Iniciando subida optimizada de camisas...');
  console.log(`📁 Ruta base: ${baseFolder}`);
  
  let totalCamisas = 0;
  let totalImagenes = 0;
  let errores = 0;

  try {
    const categorias = fs.readdirSync(baseFolder);
    console.log(`📂 Categorías encontradas: ${categorias.join(', ')}`);

    for (const categoria of categorias) {
      const categoriaPath = path.join(baseFolder, categoria);
      
      // Verificar que sea un directorio
      if (!fs.statSync(categoriaPath).isDirectory()) {
        console.log(`⚠️  Saltando ${categoria} (no es directorio)`);
        continue;
      }

      console.log(`\n🏷️  Procesando categoría: ${categoria}`);
      const subcategorias = fs.readdirSync(categoriaPath);

      for (const subcategoria of subcategorias) {
        const subPath = path.join(categoriaPath, subcategoria);
        
        // Verificar que sea un directorio
        if (!fs.statSync(subPath).isDirectory()) {
          console.log(`⚠️  Saltando ${subcategoria} (no es directorio)`);
          continue;
        }

        console.log(`  👕 Procesando camisa: ${subcategoria}`);
        
        try {
          // Verificar si la camisa ya existe
          let camisa = await Camisa.findOne({ categoria, subcategoria });
          
          if (camisa) {
            console.log(`  ℹ️  Camisa ya existe, agregando imágenes: ${subcategoria}`);
          } else {
            // Crear nueva camisa
            camisa = new Camisa({
              categoria,
              subcategoria,
              imagenes: []
            });
            console.log(`  ✨ Nueva camisa creada: ${subcategoria}`);
          }

          const files = fs.readdirSync(subPath);
          const imagenesValidas = files.filter(esImagenValida);
          
          console.log(`  📸 Imágenes encontradas: ${imagenesValidas.length}`);

          for (const file of imagenesValidas) {
            const filePath = path.join(subPath, file);
            
            try {
              // Verificar si la imagen ya existe en la camisa
              const imagenExiste = camisa.imagenes.some(img => img.fileName === file);
              
              if (imagenExiste) {
                console.log(`    ⏭️  Imagen ya existe: ${file}`);
                continue;
              }

              // Subir a Cloudinary
              console.log(`    ⬆️  Subiendo: ${file}`);
              const result = await cloudinary.uploader.upload(filePath, {
                folder: `camisas/${categoria}/${limpiarNombre(subcategoria)}`,
                public_id: `${limpiarNombre(subcategoria)}_${Date.now()}`,
                resource_type: "image",
                overwrite: false
              });

              // Agregar imagen a la camisa
              camisa.agregarImagen(result.secure_url, result.public_id, file);
              totalImagenes++;

              console.log(`    ✅ Subida exitosa: ${file}`);
              
            } catch (uploadError) {
              console.error(`    ❌ Error subiendo ${file}:`, uploadError.message);
              errores++;
            }
          }

          // Guardar la camisa con todas sus imágenes
          if (camisa.imagenes.length > 0) {
            await camisa.save();
            totalCamisas++;
            console.log(`  💾 Camisa guardada: ${subcategoria} (${camisa.imagenes.length} imágenes)`);
          } else {
            console.log(`  ⚠️  No se guardó ${subcategoria} (sin imágenes válidas)`);
          }

        } catch (camisaError) {
          console.error(`  ❌ Error procesando camisa ${subcategoria}:`, camisaError.message);
          errores++;
        }
      }
    }

    // Resumen final
    console.log('\n🎉 ¡Proceso completado!');
    console.log(`📊 Resumen:`);
    console.log(`   👕 Camisas procesadas: ${totalCamisas}`);
    console.log(`   📸 Imágenes subidas: ${totalImagenes}`);
    console.log(`   ❌ Errores: ${errores}`);
    
    // Mostrar estadísticas de la base de datos
    const totalCamisasDB = await Camisa.countDocuments();
    const totalImagenesDB = await Camisa.aggregate([
      { $group: { _id: null, total: { $sum: "$totalImagenes" } } }
    ]);
    
    console.log(`\n📈 Estado de la base de datos:`);
    console.log(`   👕 Total camisas en DB: ${totalCamisasDB}`);
    console.log(`   📸 Total imágenes en DB: ${totalImagenesDB[0]?.total || 0}`);

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Función para limpiar la base de datos (opcional)
async function limpiarBaseDatos() {
  console.log('🧹 Limpiando base de datos...');
  await Camisa.deleteMany({});
  console.log('✅ Base de datos limpiada');
}

// Ejecutar el script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    await limpiarBaseDatos();
  }
  
  await uploadCamisasOptimizadas();
  process.exit(0);
}

main().catch(console.error); 