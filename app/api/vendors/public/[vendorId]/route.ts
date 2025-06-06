// app/api/vendors/public/[vendorId]/route.ts - UPDATED to ensure suspended vendors are hidden
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    await connectToDB();

    const vendor = await Vendor.findById(params.vendorId)
      .select("-bankDetails -taxInfo -adminNotes -rejectionReason -suspendedReason -appealReason -appealResponse");

    // Return 404 if vendor doesn't exist OR is not approved (including suspended)
    if (!vendor || vendor.status !== "approved") {
      console.log(`Vendor ${params.vendorId} not found or not approved. Status: ${vendor?.status}`);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error("Error fetching public vendor details:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor details" },
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