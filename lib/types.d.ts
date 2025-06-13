// lib/types.d.ts - Enhanced with vendor status tracking

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
  
  // ADDED: Appeal-related properties that were missing
  appealSubmitted?: boolean;
  appealReason?: string;
  appealSubmittedAt?: Date;
  appealStatus?: "pending" | "approved" | "rejected";
  appealResponse?: string;
  appealResponseAt?: Date;
  appealResponseBy?: string;
  
  // ADDED: Additional vendor tracking properties
  totalOrders?: number;
  totalRevenue?: number;
  monthlyRevenue?: Record<string, number>;
  
  createdAt: Date;
  updatedAt: Date;
};

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
};

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
  stockQuantity: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type OrderColumnType = {
  _id: string;
  customer: string;
  products: number;
  totalAmount: number;
  createdAt: string;
  vendor?: string;
  status: string;
};

type OrderItemType = {
  product: ProductType;
  vendor: string | VendorType;
  color: string;
  size: string;
  quantity: number;
  priceAtTime: number;
};

// Enhanced vendor order tracking
type VendorOrderStatusType = "order_received" | "in_production" | "ready_to_ship" | "shipped" | "delivered" | "cancelled";

type StatusHistoryType = {
  status: VendorOrderStatusType;
  updatedAt: Date;
  updatedBy: string;
  customerMessage: string;
};

type TrackingInfoType = {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
};

type VendorOrderType = {
  vendor: string | VendorType;
  products: OrderItemType[];
  subtotal: number;
  commission: number;
  vendorEarnings: number;
  status: VendorOrderStatusType;
  customerStatusMessage: string;
  statusHistory: StatusHistoryType[];
  trackingInfo?: TrackingInfoType;
  lastStatusUpdate: Date;
};

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
  updatedAt: Date;
};

// Enhanced customer order tracking types
type CustomerOrderType = OrderType & {
  customerStatusSummary: string;
  vendorStatusBreakdown: {
    vendorName: string;
    status: VendorOrderStatusType;
    customerMessage: string;
    lastUpdate: string;
    trackingInfo?: TrackingInfoType;
    products: OrderItemType[];
    productCount: number;
  }[];
  hasShippedItems: boolean;
  hasDeliveredItems: boolean;
  allItemsDelivered: boolean;
  latestStatusUpdate: number;
};

type CustomerType = {
  clerkId: string;
  name: string;
  email: string;
};

type StockUpdateType = {
  productId: string;
  action: "increase" | "decrease" | "set";
  quantity: number;
  previousStock: number;
  newStock: number;
  updatedBy?: string;
  timestamp: Date;
};

type StockValidationResult = {
  productId: string;
  title: string;
  currentStock: number;
  requestedQuantity: number;
  isValid: boolean;
  message?: string;
};

type CartItemType = {
  item: ProductType;
  quantity: number;
  color?: string;
  size?: string;
};

// Vendor status update request type
type VendorStatusUpdateType = {
  status: VendorOrderStatusType;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  customMessage?: string;
};