// app/api/vendors/[vendorId]/appeal/route.ts (Updated with debug logs)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  console.log("=== APPEAL SUBMISSION DEBUG ===");
  console.log("Vendor ID:", params.vendorId);
  
  try {
    const { userId } = auth();
    console.log("User ID from auth:", userId);
    
    if (!userId) {
      console.log("ERROR: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    console.log("Connected to DB");

    const vendor = await Vendor.findById(params.vendorId);
    console.log("Vendor found:", vendor ? "YES" : "NO");
    console.log("Vendor status:", vendor?.status);
    console.log("Vendor clerkId:", vendor?.clerkId);
    
    if (!vendor) {
      console.log("ERROR: Vendor not found");
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check if this is the vendor's own account
    if (vendor.clerkId !== userId) {
      console.log("ERROR: Forbidden - vendor clerkId doesn't match userId");
      console.log("Vendor clerkId:", vendor.clerkId);
      console.log("Request userId:", userId);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { appealReason } = await req.json();
    console.log("Appeal reason received:", appealReason);

    if (!appealReason || appealReason.trim().length === 0) {
      console.log("ERROR: No appeal reason provided");
      return NextResponse.json({ error: "Appeal reason is required" }, { status: 400 });
    }

    console.log("BEFORE UPDATE:");
    console.log("appealSubmitted:", vendor.appealSubmitted);
    console.log("appealReason:", vendor.appealReason);

    // Update vendor with appeal
    vendor.appealSubmitted = true;
    vendor.appealReason = appealReason.trim();
    vendor.appealSubmittedAt = new Date();
    vendor.appealResponse = "";
    vendor.appealResponseAt = null;
    
    console.log("AFTER UPDATE (before save):");
    console.log("appealSubmitted:", vendor.appealSubmitted);
    console.log("appealReason:", vendor.appealReason);
    console.log("appealSubmittedAt:", vendor.appealSubmittedAt);
    
    const savedVendor = await vendor.save();
    console.log("Vendor saved successfully");
    console.log("Saved vendor appealSubmitted:", savedVendor.appealSubmitted);

    return NextResponse.json({ message: "Appeal submitted successfully", vendor: savedVendor }, { status: 200 });
  } catch (error) {
    console.error("ERROR in appeal submission:", error);
    return NextResponse.json(
      { error: "Failed to submit appeal" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";