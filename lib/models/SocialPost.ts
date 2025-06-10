import mongoose from "mongoose";

// Ensure Product and Vendor schemas are registered before using them as refs
import Product from "./Product";
import Vendor from "./Vendor";

// Clear cached model to ensure schema updates
if (mongoose.models.SocialPost) {
  delete mongoose.models.SocialPost;
}

const SocialPostSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  platform: {
    type: String,
    enum: ["instagram", "facebook"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SocialPost = mongoose.models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);

export default SocialPost;
