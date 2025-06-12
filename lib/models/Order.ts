// lib/models/Order.ts (Complete Enhanced Version)
import mongoose from "mongoose";

interface IOrderDocument extends mongoose.Document {
  customerClerkId: string;
  products: Array<{
    product: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    color: string;
    size: string;
    quantity: number;
    priceAtTime: number;
  }>;
  vendorOrders: Array<{
    vendor: mongoose.Types.ObjectId;
    products: Array<{
      product: mongoose.Types.ObjectId;
      color: string;
      size: string;
      quantity: number;
      priceAtTime: number;
    }>;
    subtotal: number;
    commission: number;
    vendorEarnings: number;
    status: "order_received" | "in_production" | "ready_to_ship" | "shipped" | "delivered" | "cancelled";
    customerStatusMessage: string;
    statusHistory: Array<{
      status: string;
      updatedAt: Date;
      updatedBy: string;
      customerMessage: string;
    }>;
    trackingInfo?: {
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: Date;
    };
    lastStatusUpdate: Date;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingRate: string;
  totalAmount: number;
  platformFee: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrderDocument>({
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
  // Enhanced vendor orders with customer-visible status tracking
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
      // Enhanced status system with customer-friendly messages
      status: {
        type: String,
        enum: ["order_received", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled"],
        default: "order_received"
      },
      // Customer-visible status messages
      customerStatusMessage: {
        type: String,
        default: function(this: any) {
          const statusMessages: Record<string, string> = {
            "order_received": "Vendor has seen your order",
            "in_production": "In production",
            "ready_to_ship": "Ready for delivery", 
            "shipped": "Sent for delivery",
            "delivered": "Delivered",
            "cancelled": "Cancelled"
          };
          return statusMessages[this.status as string] || "Processing";
        }
      },
      // Track status update history
      statusHistory: [{
        status: {
          type: String,
          enum: ["order_received", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled"]
        },
        updatedAt: {
          type: Date,
          default: Date.now
        },
        updatedBy: String, // Vendor ID who made the update
        customerMessage: String // Message shown to customer
      }],
      // Tracking information for shipped orders
      trackingInfo: {
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date
      },
      lastStatusUpdate: {
        type: Date,
        default: Date.now
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
  // Overall order status (derived from vendor statuses)
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
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Pre-save middleware to update overall order status based on vendor statuses
orderSchema.pre('save', function(this: IOrderDocument, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.vendorOrders && this.vendorOrders.length > 0) {
    const vendorStatuses = this.vendorOrders.map((vo) => vo.status);
    
    // Determine overall order status
    if (vendorStatuses.every((status: string) => status === "delivered")) {
      this.status = "delivered";
    } else if (vendorStatuses.some((status: string) => status === "shipped")) {
      this.status = "shipped";
    } else if (vendorStatuses.some((status: string) => ["in_production", "ready_to_ship"].includes(status))) {
      this.status = "processing";
    } else if (vendorStatuses.every((status: string) => status === "cancelled")) {
      this.status = "cancelled";
    } else {
      this.status = "pending";
    }
  }
  
  this.updatedAt = new Date();
  next();
});

const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>("Order", orderSchema);

export default OrderModel;