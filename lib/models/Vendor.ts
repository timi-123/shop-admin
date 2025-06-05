// lib/models/Vendor.ts - COMPLETE WITH ALL FIELDS INCLUDING APPEALS
import mongoose from "mongoose";

// FORCE MODEL REFRESH - Clear cached model to ensure schema updates
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
  logo: String, // URL to uploaded logo image
  
  // Business address information
  businessAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  
  // Vendor status in the system
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
  },
  
  // Tax information
  taxInfo: {
    taxId: String,
    vatNumber: String,
  },
  
  // Banking details for payments
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
  },
  
  // Social media presence
  socialMedia: {
    website: String,
    facebook: String,
    instagram: String,
    twitter: String,
  },
  
  // Admin management fields
  adminNotes: String, // Internal admin notes
  rejectionReason: String, // Reason for rejection if status is rejected
  approvedAt: Date, // When the vendor was approved
  approvedBy: String, // Admin ID who approved the vendor
  
  // Suspension fields
  suspendedAt: Date, // When the vendor was suspended
  suspendedReason: String, // Reason for suspension
  suspendedBy: String, // Admin ID who suspended the vendor
  
  // APPEAL SYSTEM FIELDS - CRITICAL FOR APPEAL FUNCTIONALITY
  appealSubmitted: {
    type: Boolean,
    default: false,
  },
  appealReason: String, // Vendor's reason for appealing the suspension
  appealSubmittedAt: Date, // When the appeal was submitted
  appealReviewedAt: Date, // When admin reviewed the appeal
  appealReviewedBy: String, // Admin ID who reviewed the appeal
  appealStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appealReviewNotes: String, // Admin's notes/response on the appeal
  
  // Legacy appeal fields (keeping for compatibility)
  appealResponse: String, // Admin's response to the appeal
  appealResponseAt: Date, // When admin responded to the appeal
  
  // Timestamp fields
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Schema options
  timestamps: true, // Automatically manage createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure boolean fields are properly returned
      ret.appealSubmitted = Boolean(ret.appealSubmitted);
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Pre-save middleware to update timestamps
vendorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure appealSubmitted is properly set
  if (this.appealSubmitted === undefined || this.appealSubmitted === null) {
    this.appealSubmitted = false;
  }
  
  next();
});

// Indexes for better query performance
vendorSchema.index({ clerkId: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ email: 1 });
vendorSchema.index({ appealSubmitted: 1 });

// Create and export the model
const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;