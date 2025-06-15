// app/api/admin/fix-platform-fees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    // Verify admin user
    if (!userId || !process.env.ADMIN_EMAILS?.split(',').includes(userId)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await connectToDB();
    
    // Get all orders
    const orders = await Order.find();
    console.log(`Found ${orders.length} orders to process`);
      interface FeeUpdateDetail {
      orderId: string;
      originalFee: string;
      newFee: string;
      difference: string;
    }
    
    const results = {
      totalOrders: orders.length,
      ordersUpdated: 0,
      details: [] as FeeUpdateDetail[]
    };
    
    // Update each order
    for (const order of orders) {
      // Save original value for reporting
      const originalPlatformFee = order.platformFee || 0;
      
      // Recalculate platformFee based on 7% commission rate
      let totalNewCommission = 0;
      
      for (const vendorOrder of order.vendorOrders) {
        const subtotal = vendorOrder.subtotal;
        const newCommission = subtotal * 0.07; // 7% commission rate
        
        // Update vendor order with new commission and earnings
        vendorOrder.commission = parseFloat(newCommission.toFixed(2));
        vendorOrder.vendorEarnings = parseFloat((subtotal - newCommission).toFixed(2));
        
        totalNewCommission += newCommission;
      }
      
      // Update order platformFee
      order.platformFee = parseFloat(totalNewCommission.toFixed(2));
      
      // Only update if the fee has changed
      if (originalPlatformFee !== order.platformFee) {
        await order.save();
        
        results.ordersUpdated++;
        results.details.push({
          orderId: order._id,
          originalFee: originalPlatformFee.toFixed(2),
          newFee: order.platformFee.toFixed(2),
          difference: (order.platformFee - originalPlatformFee).toFixed(2)
        });
      }
    }
    
    console.log(`Updated ${results.ordersUpdated} orders with the new 7% platform fee.`);
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error("Error fixing platform fees:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fix platform fees" },
      { status: 500 }
    );
  }
}

// Using force-dynamic to prevent caching
export const dynamic = "force-dynamic";
