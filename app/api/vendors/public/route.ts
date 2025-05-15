// app/api/vendors/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

// Public API to get approved vendors for store
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    // Only get approved vendors
    const vendors = await Vendor.find({ status: "approved" })
      .select("-bankDetails -taxInfo -adminNotes -rejectionReason")
      .sort({ createdAt: "desc" });

    return NextResponse.json(vendors, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error("Error fetching public vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
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