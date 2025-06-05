// app/api/appeals/route.ts (Updated with debug logs)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

export async function GET(req: NextRequest) {
  console.log("=== APPEALS API DEBUG ===");
  
  try {
    const { userId } = auth();
    console.log("User ID:", userId);
    
    if (!userId) {
      console.log("ERROR: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    console.log("Connected to DB");

    // Check if user is admin
    const userRole = await Role.findOne({ clerkId: userId });
    console.log("User role:", userRole?.role);
    
    if (!userRole || userRole.role !== "admin") {
      console.log("ERROR: User is not admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get only suspended vendors (whether they have appeals or not)
    const appeals = await Vendor.find({
      status: "suspended"
    }).sort({ appealSubmittedAt: "desc" });

    console.log("Found suspended vendors:", appeals.length);
    
    // Log each vendor's appeal status
    appeals.forEach((vendor, index) => {
      console.log(`Vendor ${index + 1}:`, {
        businessName: vendor.businessName,
        status: vendor.status,
        appealSubmitted: vendor.appealSubmitted,
        appealReason: vendor.appealReason ? "YES" : "NO",
        appealSubmittedAt: vendor.appealSubmittedAt,
        appealResponse: vendor.appealResponse ? "YES" : "NO"
      });
    });

    return NextResponse.json(appeals, { status: 200 });
  } catch (error) {
    console.error("ERROR fetching appeals:", error);
    return NextResponse.json(
      { error: "Failed to fetch appeals" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";