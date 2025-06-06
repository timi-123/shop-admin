// app/api/dashboard/stats/route.ts - Real Platform Statistics
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue from all orders
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get total customers count
    const totalCustomers = await Customer.countDocuments();

    return NextResponse.json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      totalCustomers
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";