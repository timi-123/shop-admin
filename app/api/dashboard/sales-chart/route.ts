// app/api/dashboard/sales-chart/route.ts - Real Sales Data by Month
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get sales data for the last 12 months
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Create array for last 12 months with proper month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const result = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const monthData = salesData.find(item => 
        item._id.year === year && item._id.month === month
      );
      
      result.push({
        name: monthNames[month - 1],
        sales: Math.round((monthData?.sales || 0) * 100) / 100
      });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales chart data" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";