// app/api/vendors/[vendorId]/unsuspend/route.ts
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

    // Restore vendor status
    vendor.status = "approved";
    vendor.suspendedAt = null;
    vendor.suspendedReason = "";
    vendor.suspendedBy = null;
    
    // Clear appeal data
    vendor.appealSubmitted = false;
    vendor.appealReason = "";
    vendor.appealSubmittedAt = null;
    vendor.appealResponse = "Appeal accepted - vendor reinstated";
    vendor.appealResponseAt = new Date();
    
    await vendor.save();

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error unsuspending vendor:", error);
    return NextResponse.json(
      { error: "Failed to unsuspend vendor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";