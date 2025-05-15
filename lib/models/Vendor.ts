// lib/models/Vendor.ts
import mongoose from "mongoose";

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
  // Admin notes for internal use
  adminNotes: String,
  rejectionReason: String,
  approvedAt: Date,
  approvedBy: String,
  suspendedAt: Date,
  suspendedReason: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Vendor = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);

export default Vendor;