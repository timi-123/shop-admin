// app/api/vendors/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    await connectToDB();

    // Check if vendor application already exists
    const existingVendor = await Vendor.findOne({ clerkId: userId });
    
    if (existingVendor) {
      return NextResponse.json(
        { error: "Vendor application already exists" },
        { status: 400 }
      );
    }

    const applicationData = await req.json();

    // Create new vendor application
    const vendor = await Vendor.create({
      clerkId: userId,
      email,
      ...applicationData,
      status: "pending",
    });

    await vendor.save();

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor application:", error);
    return NextResponse.json(
      { error: "Failed to create vendor application" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const vendor = await Vendor.findOne({ clerkId: userId });
    
    if (!vendor) {
      return NextResponse.json({ error: "No application found" }, { status: 404 });
    }

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor application:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor application" },
      { status: 500 }
    );
  }
}