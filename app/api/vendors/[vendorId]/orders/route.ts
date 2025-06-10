import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";
import { auth } from "@clerk/nextjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    // Verify vendor exists
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get orders that contain products from this vendor
    const orders = await Order.find({
      "vendorOrders.vendor": params.vendorId
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

    // Transform the data to include only vendor-relevant information
    const vendorOrders = orders.map((order: any) => {
      const vendorOrder = order.vendorOrders.find(
        (vo: any) => vo.vendor._id.toString() === params.vendorId
      );

      return {
        _id: order._id,
        customerClerkId: order.customerClerkId,
        products: vendorOrder?.products || [],
        subtotal: vendorOrder?.subtotal || 0,
        vendorEarnings: vendorOrder?.vendorEarnings || 0,
        commission: vendorOrder?.commission || 0,
        status: vendorOrder?.status || "pending",
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    return NextResponse.json(vendorOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor orders" },
      { status: 500 }
    );
  }
}

// Update order status for vendors
export async function PATCH(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Update the vendor order status within the order
    const order = await Order.findOneAndUpdate(
      { 
        "_id": orderId,
        "vendorOrders.vendor": params.vendorId 
      },
      { 
        $set: { 
          "vendorOrders.$.status": status,
          "updatedAt": new Date()
        }
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}