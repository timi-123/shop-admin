// app/api/vendors/[vendorId]/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order"; // Use Order instead of OrderModel
import Vendor from "@/lib/models/Vendor";
import { auth } from "@clerk/nextjs";

const STATUS_MESSAGES: Record<string, string> = {
  "order_received": "Vendor has seen your order",
  "in_production": "In production", 
  "ready_to_ship": "Ready for delivery",
  "shipped": "Sent for delivery",
  "delivered": "Delivered",
  "cancelled": "Cancelled"
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { vendorId: string; orderId: string } }
) {
  try {
    console.log("🔄 Status update request:", { vendorId: params.vendorId, orderId: params.orderId });
    
    const { userId } = auth();
    
    if (!userId) {
      console.log("❌ No userId in auth");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("👤 User ID:", userId);

    await connectToDB();

    const { status, trackingNumber, carrier, estimatedDelivery, customMessage } = await req.json();
    console.log("📝 Request body:", { status, trackingNumber, carrier, estimatedDelivery, customMessage });

    // Validate status
    const validStatuses = ["order_received", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      console.log("❌ Invalid status:", status);
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Verify vendor exists and user has permission
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      console.log("❌ Vendor not found:", params.vendorId);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    console.log("🏪 Vendor found:", vendor.businessName, "Clerk ID:", vendor.clerkId);

    // Check if user is the vendor owner or admin
    const isVendorOwner = vendor.clerkId === userId;
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(userId);

    console.log("🔐 Permission check:", { isVendorOwner, isAdmin, vendorClerkId: vendor.clerkId, userId });

    if (!isVendorOwner && !isAdmin) {
      console.log("❌ Permission denied");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find and update the order
    const order = await Order.findById(params.orderId);
    if (!order) {
      console.log("❌ Order not found:", params.orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("📦 Order found:", order._id, "Vendor orders count:", order.vendorOrders?.length);

    // Find the vendor order within the main order
    const vendorOrderIndex = order.vendorOrders.findIndex(
      (vo: any) => vo.vendor.toString() === params.vendorId
    );

    console.log("🔍 Vendor order index:", vendorOrderIndex);

    if (vendorOrderIndex === -1) {
      console.log("❌ Vendor order not found in this order");
      return NextResponse.json({ 
        error: "Vendor order not found in this order" 
      }, { status: 404 });
    }

    // Prepare the customer message
    const customerMessage = customMessage || STATUS_MESSAGES[status as string] || "Processing";
    console.log("💬 Customer message:", customerMessage);

    // Update the vendor order status
    order.vendorOrders[vendorOrderIndex].status = status;
    order.vendorOrders[vendorOrderIndex].customerStatusMessage = customerMessage;
    order.vendorOrders[vendorOrderIndex].lastStatusUpdate = new Date();

    // Add to status history
    if (!order.vendorOrders[vendorOrderIndex].statusHistory) {
      order.vendorOrders[vendorOrderIndex].statusHistory = [];
    }
    
    order.vendorOrders[vendorOrderIndex].statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: params.vendorId,
      customerMessage
    });

    // Update tracking info if provided (for shipped status)
    if (status === "shipped" && (trackingNumber || carrier || estimatedDelivery)) {
      if (!order.vendorOrders[vendorOrderIndex].trackingInfo) {
        order.vendorOrders[vendorOrderIndex].trackingInfo = {};
      }
      
      order.vendorOrders[vendorOrderIndex].trackingInfo = {
        trackingNumber: trackingNumber || order.vendorOrders[vendorOrderIndex].trackingInfo?.trackingNumber,
        carrier: carrier || order.vendorOrders[vendorOrderIndex].trackingInfo?.carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.vendorOrders[vendorOrderIndex].trackingInfo?.estimatedDelivery
      };
    }

    // Save the order (pre-save middleware will update overall status)
    await order.save();
    console.log("✅ Order saved successfully");

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      vendorOrder: order.vendorOrders[vendorOrderIndex],
      overallOrderStatus: order.status
    }, { status: 200 });

  } catch (error) {
    console.error("💥 Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string; orderId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    // Find the order and get status history
    const order = await Order.findById(params.orderId)
      .populate({
        path: "vendorOrders.vendor",
        model: Vendor,
        select: "businessName"
      });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const vendorOrder = order.vendorOrders.find(
      (vo: any) => vo.vendor._id.toString() === params.vendorId
    );

    if (!vendorOrder) {
      return NextResponse.json({ 
        error: "Vendor order not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      currentStatus: vendorOrder.status,
      customerMessage: vendorOrder.customerStatusMessage,
      statusHistory: vendorOrder.statusHistory,
      trackingInfo: vendorOrder.trackingInfo,
      lastUpdate: vendorOrder.lastStatusUpdate
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: "Failed to fetch order status" },
      { status: 500 }
    );
  }
}