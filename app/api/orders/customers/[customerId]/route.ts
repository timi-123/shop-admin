// app/api/orders/customers/[customerId]/route.ts (ADMIN PROJECT)
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

    console.log(`Fetching orders for customer: ${params.customerId}`);

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

    console.log(`Found ${orders.length} orders for customer ${params.customerId}`);

    return NextResponse.json(orders, { 
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