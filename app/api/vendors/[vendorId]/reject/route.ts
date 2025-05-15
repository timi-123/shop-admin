// app/api/vendors/[vendorId]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Check if user is admin
    const userRole = await Role.findOne({ clerkId: userId });
    
    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { reason } = await req.json();

    // Update vendor status
    vendor.status = "rejected";
    vendor.rejectionReason = reason;
    await vendor.save();

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    return NextResponse.json(
      { error: "Failed to reject vendor" },
      { status: 500 }
    );
  }
}