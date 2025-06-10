import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

// Type definitions
interface AdminProduct {
  _id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  collections: any[];
  tags: string[];
  price: number;
  expense: number;
  sizes: string[];
  colors: string[];
  vendor: string | any;
  isApproved: boolean;
  stockQuantity: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface VendorType {
  _id: string;
  clerkId: string;
  businessName: string;
  email: string;
  phoneNumber?: string;
  businessDescription?: string;
  logo?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  totalRevenue: number;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

// Collections functions
export const getCollections = async () => {
  try {
    console.log('Fetching collections from:', `${process.env.NEXT_PUBLIC_API_URL}/collections`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch collections:', response.status);
      return [];
    }
    
    const collections = await response.json();
    console.log('Collections fetched:', collections.length);
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

export const getCollectionDetails = async (collectionId: string) => {
  try {
    console.log('Fetching collection details from:', `${process.env.NEXT_PUBLIC_API_URL}/collections/${collectionId}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/${collectionId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch collection details:', response.status);
      return null;
    }
    
    const collection = await response.json();
    return collection;
  } catch (error) {
    console.error('Error fetching collection details:', error);
    return null;
  }
};

// Products functions
export const getProducts = async () => {
  try {
    console.log('Fetching products from:', `${process.env.NEXT_PUBLIC_API_URL}/products`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch products:', response.status);
      return [];
    }
    
    const products = await response.json() as AdminProduct[];
    console.log('Products fetched:', products.length);
    
    const mappedProducts = products.map((product: AdminProduct) => ({
      ...product,
      cost: product.expense
    }));
    
    return mappedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductDetails = async (productId: string) => {
  try {
    console.log('Fetching product details from:', `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch product details:', response.status);
      return null;
    }
    
    const product = await response.json() as AdminProduct;
    const mappedProduct = {
      ...product,
      cost: product.expense
    };
    
    return mappedProduct;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
};

export const getSearchedProducts = async (query: string) => {
  try {
    console.log('Searching products with query:', query);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search/${query}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to search products:', response.status);
      return [];
    }
    
    const products = await response.json() as AdminProduct[];
    console.log('Search results:', products.length);
    
    const mappedProducts = products.map((product: AdminProduct) => ({
      ...product,
      cost: product.expense
    }));
    
    return mappedProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getRelatedProducts = async (productId: string) => {
  try {
    console.log('Fetching related products for:', productId);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/related`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch related products:', response.status);
      return [];
    }
    
    const products = await response.json() as AdminProduct[];
    console.log('Related products fetched:', products.length);
    
    const mappedProducts = products.map((product: AdminProduct) => ({
      ...product,
      cost: product.expense
    }));
    
    return mappedProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

// Orders functions
export const getOrders = async (customerId: string) => {
  try {
    console.log('Fetching orders for customer:', customerId);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/customers/${customerId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch orders:', response.status);
      return [];
    }
    
    const orders = await response.json();
    console.log('Orders fetched:', orders.length);
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Vendor functions
export const getVendors = async () => {
  try {
    console.log('Fetching vendors from:', `${process.env.NEXT_PUBLIC_API_URL}/vendors/public`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/public`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch vendors:', response.status);
      return [];
    }
    
    const vendors = await response.json();
    console.log('Vendors fetched:', vendors.length);
    return vendors;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

export const getVendorDetails = async (vendorId: string) => {
  try {
    await connectToDB();
    
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return null;
    }
    
    return vendor;
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    return null;
  }
};

export const getVendorProducts = async (vendorId: string) => {
  try {
    // Try API route first (for admin interface)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vendors/${vendorId}/products`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const products = await response.json();
        console.log(`Fetched ${products.length} products via API for vendor ${vendorId}`);
        return products;
      }
    } catch (apiError) {
      console.log('API route failed, trying direct database query');
    }

    // Fallback to direct database query
    await connectToDB();
    
    const products = await Product.find({ vendor: vendorId })
      .populate({ path: "collections", model: Collection })
      .sort({ createdAt: "desc" });
    
    console.log(`Fetched ${products.length} products via database for vendor ${vendorId}`);
    return products;
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return [];
  }
};

export const getVendorOrders = async (vendorId: string) => {
  try {
    await connectToDB();

    const orders = await Order.find({
      "vendorOrders.vendor": vendorId
    })
    .populate({
      path: "products.product",
      model: Product,
      select: "title media price"
    })
    .populate({
      path: "vendorOrders.vendor",
      model: Vendor,
      select: "businessName email"
    })
    .sort({ createdAt: "desc" });

    // Transform the data - simple array operations only
    const transformedOrders = [];
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      let vendorOrder = null;
      
      // Find vendor order without using advanced array methods
      for (let j = 0; j < order.vendorOrders.length; j++) {
        if (order.vendorOrders[j].vendor._id.toString() === vendorId) {
          vendorOrder = order.vendorOrders[j];
          break;
        }
      }

      const transformedOrder = {
        _id: order._id,
        customerName: order.customerClerkId,
        customerEmail: order.customerClerkId,
        products: vendorOrder ? vendorOrder.products : [],
        subtotal: vendorOrder ? vendorOrder.subtotal : 0,
        vendorEarnings: vendorOrder ? vendorOrder.vendorEarnings : 0,
        commission: vendorOrder ? vendorOrder.commission : 0,
        status: vendorOrder ? vendorOrder.status : "pending",
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        vendorOrders: vendorOrder ? [vendorOrder] : []
      };
      
      transformedOrders.push(transformedOrder);
    }

    return transformedOrders;
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return [];
  }
};

// Additional vendor functions from your existing code
export const getVendorFromAPI = async (vendorId: string) => {
  try {
    console.log('Fetching vendor details from:', `${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch vendor details:', response.status);
      return null;
    }
    
    const vendor = await response.json();
    return vendor;
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    return null;
  }
};

export const getVendorProductsFromAPI = async (vendorId: string) => {
  try {
    console.log('Fetching vendor products from:', `${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}/products`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}/products`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch vendor products:', response.status);
      return [];
    }
    
    const products = await response.json() as AdminProduct[];
    console.log('Vendor products fetched:', products.length);
    
    const mappedProducts = products.map((product: AdminProduct) => ({
      ...product,
      cost: product.expense
    }));
    
    return mappedProducts;
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return [];
  }
};

export const getVendorCollections = async (vendorId: string) => {
  try {
    console.log('Fetching vendor collections from:', `${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}/collections`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/public/${vendorId}/collections`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch vendor collections:', response.status);
      return [];
    }
    
    const collections = await response.json();
    console.log('Vendor collections fetched:', collections.length);
    return collections;
  } catch (error) {
    console.error('Error fetching vendor collections:', error);
    return [];
  }
};