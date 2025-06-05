// app/api/vendors/[vendorId]/suspend/route.ts
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

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "Suspension reason is required" }, { status: 400 });
    }

    // Update vendor status
    vendor.status = "suspended";
    vendor.suspendedAt = new Date();
    vendor.suspendedReason = reason.trim();
    vendor.suspendedBy = userId;
    
    // Clear any existing appeals
    vendor.appealSubmitted = false;
    vendor.appealReason = "";
    vendor.appealSubmittedAt = null;
    vendor.appealResponse = "";
    vendor.appealResponseAt = null;
    
    await vendor.save();

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error suspending vendor:", error);
    return NextResponse.json(
      { error: "Failed to suspend vendor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";