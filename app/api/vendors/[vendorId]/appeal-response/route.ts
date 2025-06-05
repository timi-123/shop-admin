// app/api/vendors/[vendorId]/appeal-response/route.ts
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

    const { response, action } = await req.json(); // action: 'approve' or 'reject'

    if (!response || response.trim().length === 0) {
      return NextResponse.json({ error: "Response is required" }, { status: 400 });
    }

    // Update appeal response
    vendor.appealResponse = response.trim();
    vendor.appealResponseAt = new Date();
    
    if (action === 'approve') {
      // Restore vendor status
      vendor.status = "approved";
      vendor.suspendedAt = null;
      vendor.suspendedReason = "";
      vendor.suspendedBy = null;
    }
    // If action === 'reject', keep vendor suspended
    
    await vendor.save();

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error responding to appeal:", error);
    return NextResponse.json(
      { error: "Failed to respond to appeal" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";