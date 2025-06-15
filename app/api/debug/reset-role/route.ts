// app/api/debug/reset-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Role from "@/lib/models/Role";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDB();
    
    // Find the role document for this user
    const existingRole = await Role.findOne({ clerkId: userId });
    
    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" }, 
        { status: 404 }
      );
    }

    // Update the role to "user"
    existingRole.role = "user";
    await existingRole.save();
    
    return NextResponse.json({
      success: true,
      message: "Role reset to 'user' successfully",
      previousRole: existingRole.role,
      currentRole: "user"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error resetting role:", error);
    return NextResponse.json(
      { error: "Failed to reset role" },
      { status: 500 }
    );
  }
}

// Make sure this is always fresh
export const dynamic = "force-dynamic";
