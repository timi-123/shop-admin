// app/api/vendors/public/[vendorId]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    await connectToDB();

    // Check if vendor exists and is approved
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor || vendor.status !== "approved") {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get vendor products
    const products = await Product.find({ 
      vendor: params.vendorId,
      isApproved: true 
    })
      .populate({ path: "collections", model: Collection })
      .populate({ path: "vendor", model: Vendor, select: "businessName" })
      .sort({ createdAt: "desc" });

    return NextResponse.json(products, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error("Error fetching public vendor products:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor products" },
      { status: 500 }
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