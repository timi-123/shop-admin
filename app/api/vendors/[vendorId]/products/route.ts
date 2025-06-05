// app/api/vendors/[vendorId]/products/route.ts - Updated without cost and tags
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  console.log("--- PRODUCT POST REQUEST START ---");
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
    console.log("Checking user permissions...");
    const userRole = await Role.findOne({ clerkId: userId });
    console.log("User role:", userRole?.role);
    
    const isAdmin = userRole?.role === "admin";
    const isVendorOwner = vendor.clerkId === userId;
    
    console.log("Is admin:", isAdmin);
    console.log("Vendor clerkId:", vendor.clerkId);
    console.log("User clerkId:", userId);
    console.log("Is vendor owner:", isVendorOwner);

    // Always allow admin users or the vendor owner
    if (!isAdmin && !isVendorOwner) {
      console.log("Permission denied: User is not admin and not the vendor owner");
      return NextResponse.json({ 
        error: "You don't have permission to create products for this vendor" 
      }, { status: 403 });
    }
    
    console.log("Permission check passed!");

    console.log("Parsing request body...");
    const productData = await req.json();
    console.log("Product data received:", JSON.stringify(productData, null, 2));

    // Validate required fields (removed category from validation)
    if (!productData.title || !productData.media || productData.media.length === 0 || !productData.price) {
      console.log("Validation error: Missing required fields");
      return NextResponse.json(
        { error: "Title, media, and price are required" },
        { status: 400 }
      );
    }

    console.log("Creating product for vendor:", params.vendorId);
    
    // Create new product (removed category)
    const newProduct = await Product.create({
      title: productData.title,
      description: productData.description,
      media: productData.media,
      collections: productData.collections,
      sizes: productData.sizes,
      colors: productData.colors,
      price: productData.price,
      vendor: params.vendorId,
    });

    await newProduct.save();
    console.log("Product created with ID:", newProduct._id);

    // Update collections if provided
    if (productData.collections && Array.isArray(productData.collections)) {
      console.log("Updating collections with the new product");
      for (const collectionId of productData.collections) {
        const collection = await Collection.findById(collectionId);
        if (collection && collection.vendor.toString() === params.vendorId) {
          collection.products.push(newProduct._id);
          await collection.save();
          console.log(`Added product to collection: ${collectionId}`);
        } else {
          console.log(`Collection not found or doesn't belong to this vendor: ${collectionId}`);
        }
      }
    }

    // Add populated collections for the response
    const populatedProduct = await Product.findById(newProduct._id).populate({
      path: "collections",
      model: Collection,
      select: "title _id"
    });

    console.log("Product created successfully:", newProduct._id);
    console.log("--- PRODUCT POST REQUEST END ---");
    
    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vendor product:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    console.log("--- PRODUCT POST REQUEST END WITH ERROR ---");
    
    return NextResponse.json(
      { error: `Failed to create vendor product: ${error.message}` },
      { status: 500 }
    );
  }
}