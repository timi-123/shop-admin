// app/api/vendors/[vendorId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

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

    // Get vendor
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get user's role
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    
    // Check permissions - admin can view all, vendors can only view themselves
    if (!isAdmin && vendor.clerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

// Add support for dynamic route
export const dynamic = "force-dynamic";