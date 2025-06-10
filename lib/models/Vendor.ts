import mongoose from "mongoose";

// Clear cached model to ensure schema updates
if (mongoose.models.Vendor) {
  delete mongoose.models.Vendor;
}

const vendorSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: String,
  businessDescription: String,
  logo: String,
  
  businessAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
  },
  
  taxInfo: {
    taxId: String,
    vatNumber: String,
  },
  
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
  },
  
  socialMedia: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  
  adminNotes: String,
  rejectionReason: String,
  approvedAt: Date,
  approvedBy: String,
  
  suspendedAt: Date,
  suspendedReason: String,
  suspendedBy: String,
  
  appealSubmitted: {
    type: Boolean,
    default: false,
  },
  appealReason: String,
  appealSubmittedAt: Date,
  appealReviewedAt: Date,
  appealReviewedBy: String,
  appealStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appealReviewNotes: String,
  
  // Revenue tracking fields
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  monthlyRevenue: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  
}, {
  timestamps: true,
});

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;