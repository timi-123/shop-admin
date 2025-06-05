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
      console.log("No userId found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get user's role
    const userRole = await Role.findOne({ clerkId: userId });
    
    if (!userRole) {
      console.log(`No role found for user ${userId}`);
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    
    if (userRole.role !== "vendor") {
      console.log(`User ${userId} has role ${userRole.role}, not vendor`);
      return NextResponse.json({ error: "Not a vendor" }, { status: 403 });
    }

    // Find vendor with matching clerkId
    const vendor = await Vendor.findOne({ clerkId: userId });
    
    console.log("=== MY-VENDOR API DEBUG ===");
    console.log("User ID:", userId);
    console.log("Vendor found:", vendor ? "YES" : "NO");
    console.log("Appeal submitted from DB:", vendor?.appealSubmitted);
    console.log("Appeal reason from DB:", vendor?.appealReason);
    console.log("Raw vendor object:", JSON.stringify(vendor, null, 2));

    if (!vendor) {
      console.error(`No vendor found for clerkId: ${userId}`);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    console.log(`Retrieved vendor data for clerkId: ${userId}, vendorId: ${vendor._id}`);
    
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