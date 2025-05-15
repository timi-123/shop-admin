// app/api/vendors/[vendorId]/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";
import Customer from "@/lib/models/Customer";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get vendor first to verify it exists
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;

    if (!isAdmin && !isVendorOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find orders that contain products from this vendor
    // Use the vendorOrders array which groups products by vendor
    const orders = await Order.find({
      "products.vendor": params.vendorId
    }).sort({ createdAt: "desc" });

    // Format orders for display
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const customer = await Customer.findOne({ clerkId: order.customerClerkId });
      
      // Filter products belonging to this vendor
      const vendorProducts = order.products.filter(
        (item: any) => item.vendor && item.vendor.toString() === params.vendorId
      );
      
      // Calculate vendor earnings for this order (assume 15% platform fee)
      const subtotal = vendorProducts.reduce((sum: number, item: any) => {
        return sum + (item.priceAtTime || 0) * (item.quantity || 1);
      }, 0);
      
      // Apply commission rate of 85% (platform keeps 15%)
      const vendorEarnings = subtotal * 0.85;
      
      return {
        _id: order._id,
        customer: customer?.name || "Unknown",
        products: vendorProducts.length,
        totalAmount: subtotal,
        vendorEarnings,
        createdAt: format(new Date(order.createdAt), "MMM do, yyyy"),
        status: order.status || "pending"
      };
    }));

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor orders" },
      { status: 500 }
    );
  }
}

// Add support for dynamic route
export const dynamic = "force-dynamic";