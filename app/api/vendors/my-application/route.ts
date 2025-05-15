// app/api/vendors/my-application/route.ts
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

    const application = await Vendor.findOne({ clerkId: userId });
    
    if (!application) {
      return NextResponse.json({ error: "No application found" }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor application:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor application" },
      { status: 500 }
    );
  }
}