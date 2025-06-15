// app/api/vendors/[vendorId]/products/route.ts - ADMIN (Updated)
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import { auth } from "@clerk/nextjs";
import { createDemoSocialPosts } from "@/lib/utils/socialPost";

// Ensure this API route always returns fresh data without caching
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
){
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    console.log(`GET products for vendor: ${params.vendorId}, requested by user: ${userId}`);

    // Verify vendor exists
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      console.log(`Vendor not found: ${params.vendorId}`);
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get vendor products
    const products = await Product.find({ 
      vendor: params.vendorId
    })
      .populate({ path: "collections", model: Collection })
      .populate({ path: "vendor", model: Vendor, select: "businessName" })
      .sort({ createdAt: "desc" });

    console.log(`Found ${products.length} products for vendor ${params.vendorId}`);

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor products" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    console.log(`--- PRODUCT POST REQUEST START ---`);
    console.log(`Creating product for vendor: ${params.vendorId}`);

    const {
      title,
      description,
      media,
      collections,
      sizes,
      colors,
      price,
      stockQuantity = 0
    } = await req.json();

    if (!title || !description || !media || !price) {
      return new NextResponse("Not enough data to create a product", {
        status: 400,
      });
    }

    // Verify vendor exists
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const newProduct = await Product.create({
      title,
      description,
      media,
      collections: collections || [],
      sizes: sizes || [],
      colors: colors || [],
      price,
      vendor: params.vendorId,
      isApproved: true, // Auto-approve for now
      stockQuantity: Math.max(0, parseInt(stockQuantity) || 0)
    });

    // Generate demo social posts for Instagram and Facebook
    await createDemoSocialPosts(newProduct, vendor);

    console.log(`Product created with ID: ${newProduct._id}`);    // Update collections with the new product
    if (collections && collections.length > 0) {
      console.log(`Adding new product ${newProduct._id} to ${collections.length} collections`);
      
      // Use updateMany with $addToSet to efficiently update collections and prevent duplicates
      await Collection.updateMany(
        { _id: { $in: collections } },
        { $addToSet: { products: newProduct._id } }
      );
      
      console.log(`Successfully added product to ${collections.length} collections`);
    }

    console.log(`Product created successfully: ${newProduct._id}`);
    console.log(`--- PRODUCT POST REQUEST END ---`);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[vendor_products_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}