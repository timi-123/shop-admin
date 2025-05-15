// lib/types.d.ts (Updated for both projects)
type VendorType = {
  _id: string;
  clerkId: string;
  businessName: string;
  email: string;
  phoneNumber?: string;
  businessDescription?: string;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: "pending" | "approved" | "rejected" | "suspended";
  taxInfo?: {
    taxId?: string;
    vatNumber?: string;
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  };
  socialMedia?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  adminNotes?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: string;
  suspendedAt?: Date;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

type CollectionType = {
  _id: string;
  title: string;
  description: string;
  image: string;
  vendor: string | VendorType;
  products: ProductType[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ProductType = {
  _id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  collections: CollectionType[];
  tags: string[];
  sizes: string[];
  colors: string[];
  price: number;
  expense: number;
  cost?: number; // Add optional cost field
  vendor: string | VendorType;
  isApproved: boolean;
  stockQuantity: number;
  createdAt: string | Date;  // Changed from Date to string | Date
  updatedAt: string | Date;  // Changed from Date to string | Date
}

type OrderColumnType = {
  _id: string;
  customer: string;
  products: number;
  totalAmount: number;
  createdAt: string;
  vendor?: string;
  status: string;
}

type OrderItemType = {
  product: ProductType;
  vendor: string | VendorType;
  color: string;
  size: string;
  quantity: number;
  priceAtTime: number;
}

type VendorOrderType = {
  vendor: string | VendorType;
  products: OrderItemType[];
  subtotal: number;
  commission: number;
  vendorEarnings: number;
  status: string;
}

type OrderType = {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  _id: string;
  customerClerkId: string;
  products: OrderItemType[];
  vendorOrders: VendorOrderType[];
  shippingRate: string;
  totalAmount: number;
  platformFee: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
}

type CustomerType = {
  clerkId: string;
  name: string;
  email: string;
}