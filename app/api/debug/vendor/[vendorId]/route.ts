// app/api/debug/vendor/[vendorId]/route.ts (Temporary debug endpoint)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Return ALL vendor fields to see what's there
    const vendorData = {
      _id: vendor._id,
      businessName: vendor.businessName,
      email: vendor.email,
      status: vendor.status,
      clerkId: vendor.clerkId,
      
      // Check appeal fields specifically
      appealSubmitted: vendor.appealSubmitted,
      appealReason: vendor.appealReason,
      appealSubmittedAt: vendor.appealSubmittedAt,
      appealResponse: vendor.appealResponse,
      appealResponseAt: vendor.appealResponseAt,
      
      // Suspension fields
      suspendedAt: vendor.suspendedAt,
      suspendedReason: vendor.suspendedReason,
      suspendedBy: vendor.suspendedBy,
      
      // All fields
      allFields: Object.keys(vendor.toObject())
    };

    return NextResponse.json(vendorData, { status: 200 });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";