// lib/models/Collection.ts (Updated)
import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    required: true,
  },
  // Add vendor reference
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Vendor",
    required: true 
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
})

const Collection = mongoose.models.Collection || mongoose.model("Collection", collectionSchema);

export default Collection;