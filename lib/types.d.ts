// lib/types.d.ts - BOTH ADMIN & STORE
type VendorType = {
  _id: string;
  clerkId: string;
  businessName: string;
  email: string;
  phoneNumber?: string;
  businessDescription?: string;
  logo?: string;
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
  cost?: number;
  vendor: string | VendorType;
  isApproved: boolean;
  stockQuantity: number; // Enhanced: Always include stock quantity
  createdAt: string | Date;
  updatedAt: string | Date;
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

// Enhanced: Stock management types
type StockUpdateType = {
  productId: string;
  action: "increase" | "decrease" | "set";
  quantity: number;
  previousStock: number;
  newStock: number;
  updatedBy?: string;
  timestamp: Date;
}

type StockValidationResult = {
  productId: string;
  title: string;
  currentStock: number;
  requestedQuantity: number;
  isValid: boolean;
  message?: string;
}

type CartItemType = {
  item: ProductType;
  quantity: number;
  color?: string;
  size?: string;
}

// Enhanced: Stock status types
type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "insufficient";

type StockInfo = {
  status: StockStatus;
  message: string;
  color: string;
  quantity: number;
}

// Enhanced: API response types for stock operations
type StockUpdateResponse = {
  success: boolean;
  product: ProductType;
  previousStock: number;
  newStock: number;
  action: string;
  quantity: number;
}

type StockValidationResponse = {
  productId: string;
  title: string;
  stockQuantity: number;
  isAvailable: boolean;
  lastUpdated: string;
  error?: string;
}

type BatchStockValidationResponse = {
  results: StockValidationResponse[];
  totalProducts: number;
  availableProducts: number;
}