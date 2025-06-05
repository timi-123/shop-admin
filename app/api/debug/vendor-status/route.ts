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
    
    console.log("=== DEBUG VENDOR STATUS ===");
    console.log("Raw vendor from DB:", JSON.stringify(vendor, null, 2));
    console.log("Appeal submitted:", vendor?.appealSubmitted);
    console.log("Appeal reason:", vendor?.appealReason);
    
    return NextResponse.json({
      vendor,
      appealSubmitted: vendor?.appealSubmitted,
      appealReason: vendor?.appealReason
    }, { status: 200 });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";