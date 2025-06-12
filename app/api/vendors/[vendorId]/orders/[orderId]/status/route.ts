// app/api/vendors/[vendorId]/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import OrderModel from "@/lib/models/Order"; // Use OrderModel if you renamed it
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
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const { status, trackingNumber, carrier, estimatedDelivery, customMessage } = await req.json();

    // Validate status
    const validStatuses = ["order_received", "in_production", "ready_to_ship", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Verify vendor exists and user has permission
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check if user is the vendor owner or admin
    const isVendorOwner = vendor.clerkId === userId;
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(userId);

    if (!isVendorOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find and update the order
    const order = await OrderModel.findById(params.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Find the vendor order within the main order
    const vendorOrderIndex = order.vendorOrders.findIndex(
      (vo: any) => vo.vendor.toString() === params.vendorId
    );

    if (vendorOrderIndex === -1) {
      return NextResponse.json({ 
        error: "Vendor order not found in this order" 
      }, { status: 404 });
    }

    // Prepare the customer message
    const customerMessage = customMessage || STATUS_MESSAGES[status as string] || "Processing";

    // Update the vendor order status
    order.vendorOrders[vendorOrderIndex].status = status;
    order.vendorOrders[vendorOrderIndex].customerStatusMessage = customerMessage;
    order.vendorOrders[vendorOrderIndex].lastStatusUpdate = new Date();

    // Add to status history
    order.vendorOrders[vendorOrderIndex].statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: params.vendorId,
      customerMessage
    });

    // Update tracking info if provided (for shipped status)
    if (status === "shipped" && (trackingNumber || carrier || estimatedDelivery)) {
      order.vendorOrders[vendorOrderIndex].trackingInfo = {
        trackingNumber: trackingNumber || order.vendorOrders[vendorOrderIndex].trackingInfo?.trackingNumber,
        carrier: carrier || order.vendorOrders[vendorOrderIndex].trackingInfo?.carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.vendorOrders[vendorOrderIndex].trackingInfo?.estimatedDelivery
      };
    }

    // Save the order (pre-save middleware will update overall status)
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      vendorOrder: order.vendorOrders[vendorOrderIndex],
      overallOrderStatus: order.status
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}