// app/api/debug/set-vendor-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Role from "@/lib/models/Role";
import Vendor from "@/lib/models/Vendor";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDB();
    
    // Check if this user has an approved vendor application
    const vendor = await Vendor.findOne({ clerkId: userId });
    
    if (!vendor) {
      return NextResponse.json(
        { error: "No vendor record found for this user" }, 
        { status: 404 }
      );
    }
    
    if (vendor.status !== "approved") {
      return NextResponse.json(
        { error: `Vendor application status is ${vendor.status}, not approved` }, 
        { status: 400 }
      );
    }
    
    // Find the role document for this user
    const existingRole = await Role.findOne({ clerkId: userId });
    
    if (!existingRole) {
      // Create new role if not exists
      const newRole = await Role.create({
        clerkId: userId,
        email: vendor.email || "unknown@email.com",
        role: "vendor",
        emailDomain: vendor.email ? vendor.email.split("@")[1] : "unknown.com"
      });
      
      await newRole.save();
      
      return NextResponse.json({
        success: true,
        message: "New vendor role created successfully",
        role: "vendor"
      }, { status: 201 });
    }
    
    // Update existing role to vendor
    existingRole.role = "vendor";
    await existingRole.save();
    
    return NextResponse.json({
      success: true,
      message: "Role updated to vendor successfully",
      previousRole: existingRole.role,
      currentRole: "vendor"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error setting vendor role:", error);
    return NextResponse.json(
      { error: "Failed to set vendor role" },
      { status: 500 }
    );
  }
}

// Make sure this is always fresh
export const dynamic = "force-dynamic";
