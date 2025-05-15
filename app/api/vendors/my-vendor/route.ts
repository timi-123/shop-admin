// app/api/vendors/my-vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

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