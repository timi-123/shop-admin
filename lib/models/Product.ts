// lib/models/Product.ts (Fixed)
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  media: [String],
  category: String,
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
  tags: [String],
  sizes: [String],
  colors: [String],
  // Fixed getter functions with null checks
  price: { 
    type: mongoose.Schema.Types.Decimal128, 
    get: (v: mongoose.Schema.Types.Decimal128 | null | undefined) => { 
      return v ? parseFloat(v.toString()) : 0;
    }
  },
  expense: { 
    type: mongoose.Schema.Types.Decimal128, 
    get: (v: mongoose.Schema.Types.Decimal128 | null | undefined) => { 
      return v ? parseFloat(v.toString()) : 0;
    }
  },
  // Add vendor reference
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vendor",
    required: true 
  },
  // Add vendor approval status
  isApproved: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { toJSON: { getters: true } });

// Clear cached model to ensure schema updates
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;