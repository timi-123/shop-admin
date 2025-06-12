// app/api/vendors/[vendorId]/products/[productId]/stock/route.ts - ADMIN
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";

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

    const { action, quantity } = await req.json();

    // Validate action
    if (!["increase", "decrease", "set"].includes(action)) {
      return new NextResponse("Invalid action. Must be 'increase', 'decrease', or 'set'", { status: 400 });
    }

    // Find the product
    const product = await Product.findById(params.productId);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check if product belongs to the vendor
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

    // Update stock based on action
    let newStockQuantity = product.stockQuantity || 0;

    switch (action) {
      case "increase":
        newStockQuantity += quantity;
        break;
      case "decrease":
        newStockQuantity = Math.max(0, newStockQuantity - quantity);
        break;
      case "set":
        newStockQuantity = Math.max(0, quantity);
        break;
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      { 
        stockQuantity: newStockQuantity,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      previousStock: product.stockQuantity,
      newStock: newStockQuantity,
      action,
      quantity
    });

  } catch (error) {
    console.error("[STOCK_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string; productId: string } }
) {
  try {
    await connectToDB();

    // Find the product
    const product = await Product.findById(params.productId);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check if product belongs to the vendor
    if (product.vendor.toString() !== params.vendorId) {
      return new NextResponse("Product does not belong to this vendor", { status: 403 });
    }

    return NextResponse.json({
      productId: product._id,
      title: product.title,
      stockQuantity: product.stockQuantity || 0,
      lastUpdated: product.updatedAt
    });

  } catch (error) {
    console.error("[STOCK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}