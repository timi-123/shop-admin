// app/api/vendors/my-vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get user's role
    const userRole = await Role.findOne({ clerkId: userId });
    
    if (!userRole || userRole.role !== "vendor") {
      return NextResponse.json({ error: "Not a vendor" }, { status: 403 });
    }

    // Find vendor with matching clerkId
    const vendor = await Vendor.findOne({ clerkId: userId });
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor data" },
      { status: 500 }
    );
  }
}

// Add support for dynamic route
export const dynamic = "force-dynamic";