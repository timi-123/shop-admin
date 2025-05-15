// lib/models/Order.ts (Updated)
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerClerkId: String,
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
      color: String,
      size: String,
      quantity: Number,
      priceAtTime: Number,
    },
  ],
  // Group products by vendor for easier management
  vendorOrders: [
    {
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          color: String,
          size: String,
          quantity: Number,
          priceAtTime: Number,
        }
      ],
      subtotal: Number,
      commission: Number,
      vendorEarnings: Number,
      status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
      }
    }
  ],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  shippingRate: String,
  totalAmount: Number,
  platformFee: Number,
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;