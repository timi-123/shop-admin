// app/api/vendors/[vendorId]/collections/[collectionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";
import Product from "@/lib/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string, collectionId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get vendor first to verify it exists
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get collection and verify it belongs to this vendor
    const collection = await Collection.findById(params.collectionId).populate({
      path: "products",
      model: Product
    });
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    if (collection.vendor.toString() !== params.vendorId) {
      return NextResponse.json({ error: "Collection does not belong to this vendor" }, { status: 403 });
    }

    // Check permissions
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;

    if (!isAdmin && !isVendorOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor collection" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string, collectionId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get vendor
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;

    if (!isAdmin && !isVendorOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get collection and verify it belongs to this vendor
    const collection = await Collection.findById(params.collectionId);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    if (collection.vendor.toString() !== params.vendorId) {
      return NextResponse.json({ error: "Collection does not belong to this vendor" }, { status: 403 });
    }

    const collectionData = await req.json();

    if (!collectionData.title || !collectionData.image) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    // Update collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      params.collectionId,
      {
        title: collectionData.title,
        description: collectionData.description || "",
        image: collectionData.image,
      },
      { new: true }
    ).populate({
      path: "products",
      model: Product
    });

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (error) {
    console.error("Error updating vendor collection:", error);
    return NextResponse.json(
      { error: "Failed to update vendor collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { vendorId: string, collectionId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get vendor
    const vendor = await Vendor.findById(params.vendorId);
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Check permissions
    const userRole = await Role.findOne({ clerkId: userId });
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;

    if (!isAdmin && !isVendorOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get collection and verify it belongs to this vendor
    const collection = await Collection.findById(params.collectionId);
    
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    
    if (collection.vendor.toString() !== params.vendorId) {
      return NextResponse.json({ error: "Collection does not belong to this vendor" }, { status: 403 });
    }

    // Remove collection reference from products
    await Product.updateMany(
      { collections: params.collectionId },
      { $pull: { collections: params.collectionId } }
    );

    // Delete collection
    await Collection.findByIdAndDelete(params.collectionId);

    return NextResponse.json({ message: "Collection deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting vendor collection:", error);
    return NextResponse.json(
      { error: "Failed to delete vendor collection" },
      { status: 500 }
    );
  }
}

// Add support for dynamic route
export const dynamic = "force-dynamic";