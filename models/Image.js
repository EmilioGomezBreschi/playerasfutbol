import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  categoria: String,
  subcategoria: String,
  imageUrl: String,
  publicId: String,
});

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
