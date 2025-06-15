// app/api/vendors/[vendorId]/products/[productId]/route.ts - ADMIN
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string; productId: string } }
) {
  try {
    await connectToDB();

    const product = await Product.findById(params.productId)
      .populate({ path: "collections", model: Collection });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Verify product belongs to vendor
    if (product.vendor.toString() !== params.vendorId) {
      return new NextResponse("Product does not belong to this vendor", { status: 403 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[vendor_product_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { vendorId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const { 
      title, 
      description, 
      media, 
      collections, 
      sizes, 
      colors, 
      price, 
      stockQuantity 
    } = await req.json();

    if (!title || !description || !media || !price) {
      return new NextResponse("Title, description, media, and price are required", { status: 400 });
    }

    // Find the existing product
    const existingProduct = await Product.findById(params.productId);
    if (!existingProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Verify product belongs to vendor
    if (existingProduct.vendor.toString() !== params.vendorId) {
      return new NextResponse("Product does not belong to this vendor", { status: 403 });
    }

    // Find the vendor and check permissions
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      return new NextResponse("Vendor not found", { status: 404 });
    }

    // Check if user has permission (vendor owner or admin)
    const isVendorOwner = vendor.clerkId === userId;
    const isAdmin = process.env.ADMIN_EMAILS?.split(',').includes(userId) || false;

    if (!isVendorOwner && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Store original collections for cleanup
    const originalCollections = existingProduct.collections;

    // Update the product with stock quantity validation
    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      {
        title,
        description,
        media,
        collections: collections || [],
        sizes: sizes || [],
        colors: colors || [],
        price,
        stockQuantity: Math.max(0, parseInt(stockQuantity) || 0), // Ensure non-negative integer
        updatedAt: new Date()
      },
      { new: true }
    ).populate({ path: "collections", model: Collection });    // Calculate collection changes instead of removing from all and re-adding    // Find collections to remove the product from (collections that are in original but not in new)
    const collectionsToRemoveFrom = originalCollections?.filter(
      (collId: string) => !collections?.includes(collId)
    ) || [];
    
    // Find collections to add the product to (collections that are in new but not in original)
    const collectionsToAddTo = collections?.filter(
      (collId: string) => !originalCollections?.includes(collId)
    ) || [];
    
    // Only remove from collections that are no longer associated
    if (collectionsToRemoveFrom.length > 0) {
      console.log(`Removing product from ${collectionsToRemoveFrom.length} collections`);
      await Collection.updateMany(
        { _id: { $in: collectionsToRemoveFrom } },
        { $pull: { products: params.productId } }
      );
    }

    // Only add to collections that are newly associated
    if (collectionsToAddTo.length > 0) {
      console.log(`Adding product to ${collectionsToAddTo.length} collections`);
      await Collection.updateMany(
        { _id: { $in: collectionsToAddTo } },
        { $addToSet: { products: params.productId } }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[vendor_product_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { vendorId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    // Find the product
    const product = await Product.findById(params.productId);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Verify product belongs to vendor
    if (product.vendor.toString() !== params.vendorId) {
      return new NextResponse("Product does not belong to this vendor", { status: 403 });
    }

    // Find the vendor and check permissions
    const vendor = await Vendor.findById(params.vendorId);
    if (!vendor) {
      return new NextResponse("Vendor not found", { status: 404 });
    }

    // Check if user has permission (vendor owner or admin)
    const isVendorOwner = vendor.clerkId === userId;
    const isAdmin = process.env.ADMIN_EMAILS?.split(',').includes(userId) || false;

    if (!isVendorOwner && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Remove product from all collections
    await Collection.updateMany(
      { products: params.productId },
      { $pull: { products: params.productId } }
    );

    // Delete the product
    await Product.findByIdAndDelete(params.productId);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("[vendor_product_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}