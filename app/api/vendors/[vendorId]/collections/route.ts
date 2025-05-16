// app/api/vendors/[vendorId]/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";
import Product from "@/lib/models/Product";

// app/api/vendors/[vendorId]/collections/route.ts
// Only updating the GET method for better error handling

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log("No userId found in auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`GET collections for vendor: ${params.vendorId}, requested by user: ${userId}`);
    await connectToDB();

    // Get vendor first to verify it exists
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      console.log(`Vendor not found with ID: ${params.vendorId}`);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;

    console.log(`Permission check: isAdmin=${isAdmin}, isVendorOwner=${isVendorOwner}, vendorClerkId=${vendor.clerkId}`);

    if (!isAdmin && !isVendorOwner) {
      console.log(`Permission denied for user ${userId}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all collections for this vendor
    const collections = await Collection.find({ 
      vendor: params.vendorId 
    }).populate({
      path: "products",
      model: Product
    }).sort({ createdAt: "desc" });

    console.log(`Found ${collections.length} collections for vendor ${params.vendorId}`);
    
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error(`Error fetching vendor collections for ${params.vendorId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch vendor collections" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  console.log("--- COLLECTION POST REQUEST START ---");
  console.log("Vendor ID:", params.vendorId);
  
  try {
    const { userId } = auth();
    console.log("User ID from auth:", userId);
    
    if (!userId) {
      console.log("Unauthorized: No user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Connecting to DB...");
    await connectToDB();

    // Get vendor
    console.log("Fetching vendor with ID:", params.vendorId);
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      console.log("Vendor not found with ID:", params.vendorId);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
    console.log("Vendor found:", vendor.businessName);

    // Check permissions
    console.log("Checking permissions...");
    const userRole = await Role.findOne({ clerkId: userId });
    console.log("User role:", userRole?.role);
    
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;
    console.log("Is admin:", isAdmin);
    console.log("Vendor clerkId:", vendor.clerkId);
    console.log("User clerkId:", userId);
    console.log("Is vendor owner:", isVendorOwner);

    if (!isAdmin && !isVendorOwner) {
      console.log("Forbidden: User does not have permission");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Parsing request body...");
    const collectionData = await req.json();
    console.log("Collection data received:", JSON.stringify(collectionData, null, 2));

    if (!collectionData.title || !collectionData.image) {
      console.log("Validation error: Missing title or image");
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    console.log("Creating collection for vendor:", params.vendorId);
    
    // Create new collection
    const newCollection = await Collection.create({
      title: collectionData.title,
      description: collectionData.description || "",
      image: collectionData.image,
      vendor: params.vendorId,
      products: [],
      isActive: true
    });

    await newCollection.save();
    console.log("Collection created successfully with ID:", newCollection._id);

    const result = { 
      _id: newCollection._id,
      title: newCollection.title,
      image: newCollection.image,
      vendor: newCollection.vendor,
      message: "Collection created successfully" 
    };
    
    console.log("Returning response:", JSON.stringify(result, null, 2));
    console.log("--- COLLECTION POST REQUEST END ---");
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vendor collection:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    console.log("--- COLLECTION POST REQUEST END WITH ERROR ---");
    
    return NextResponse.json(
      { error: `Failed to create vendor collection: ${error.message}` },
      { status: 500 }
    );
  }
}

// Add support for dynamic route
export const dynamic = "force-dynamic";