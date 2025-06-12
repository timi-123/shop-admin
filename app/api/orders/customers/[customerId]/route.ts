// app/api/orders/customers/[customerId]/route.ts (Enhanced for customer order tracking)
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await connectToDB();

    console.log(`Fetching orders with vendor status for customer: ${params.customerId}`);

    if (!params.customerId || params.customerId === 'null' || params.customerId === 'undefined') {
      console.log('Invalid customer ID provided');
      return NextResponse.json([], { 
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    const orders = await Order.find({ 
      customerClerkId: params.customerId 
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

    // Transform orders to include vendor status information for customers
    const enhancedOrders = orders.map((order: any) => {
      // Group vendor statuses for customer display
      const vendorStatusSummary = order.vendorOrders.map((vendorOrder: any) => ({
        vendorName: vendorOrder.vendor.businessName,
        status: vendorOrder.status,
        customerMessage: vendorOrder.customerStatusMessage,
        lastUpdate: vendorOrder.lastStatusUpdate,
        trackingInfo: vendorOrder.trackingInfo,
        products: vendorOrder.products,
        productCount: vendorOrder.products.length
      }));

      // Determine the most relevant status to show customer
      const getOverallCustomerStatus = () => {
        const statuses = order.vendorOrders.map((vo: any) => vo.status);
        
        if (statuses.every((s: string) => s === "delivered")) return "All items delivered";
        if (statuses.some((s: string) => s === "shipped")) return "Some items shipped";
        if (statuses.some((s: string) => s === "ready_to_ship")) return "Items ready for delivery";
        if (statuses.some((s: string) => s === "in_production")) return "Items in production";
        if (statuses.every((s: string) => s === "order_received")) return "Orders confirmed by vendors";
        return "Processing your order";
      };

      return {
        _id: order._id,
        customerClerkId: order.customerClerkId,
        products: order.products,
        vendorOrders: order.vendorOrders,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        
        // Enhanced customer-facing information
        customerStatusSummary: getOverallCustomerStatus(),
        vendorStatusBreakdown: vendorStatusSummary,
        
        // Quick status indicators for UI
        hasShippedItems: order.vendorOrders.some((vo: any) => vo.status === "shipped"),
        hasDeliveredItems: order.vendorOrders.some((vo: any) => vo.status === "delivered"),
        allItemsDelivered: order.vendorOrders.every((vo: any) => vo.status === "delivered"),
        
        // Latest update info
        latestStatusUpdate: Math.max(...order.vendorOrders.map((vo: any) => 
          new Date(vo.lastStatusUpdate).getTime()
        ))
      };
    });

    console.log(`Found ${enhancedOrders.length} orders with vendor status for customer ${params.customerId}`);

    return NextResponse.json(enhancedOrders, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
    );
  }
}

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};