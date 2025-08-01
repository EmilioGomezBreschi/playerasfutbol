import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <-- Esto es CLAVE

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Validaciones opcionales
if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida");
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("❌ CLOUDINARY_API_KEY no está definida");
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary, mongoose };
