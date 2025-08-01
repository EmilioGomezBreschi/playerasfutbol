import fs from "fs";
import path from "path";
import { cloudinary } from "../../lib/config.js";
import Image from "../../models/Image.js";

// Ruta absoluta a las imágenes externas
const baseFolder = "C:/Users/lime1/Documents/Chong-Scrap/imagenes";

async function uploadImages() {
  const categorias = fs.readdirSync(baseFolder); // JUGADOR, etc.

  for (const categoria of categorias) {
    const categoriaPath = path.join(baseFolder, categoria);
    const subcategorias = fs.readdirSync(categoriaPath);

    for (const subcategoria of subcategorias) {
      const subPath = path.join(categoriaPath, subcategoria);
      const files = fs.readdirSync(subPath);

      for (const file of files) {
        const filePath = path.join(subPath, file);
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: `${categoria}/${subcategoria}`,
          });

          // Guardar en MongoDB (opcional)
          await Image.create({
            categoria,
            subcategoria,
            imageUrl: result.secure_url,
            publicId: result.public_id,
          });

          console.log(`✅ ${file} subida a ${categoria}/${subcategoria}`);
        } catch (err) {
          console.error(`❌ Error subiendo ${file}:`, err.message);
        }
      }
    }
  }
}

uploadImages();
