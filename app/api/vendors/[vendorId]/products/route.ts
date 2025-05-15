// app/api/vendors/[vendorId]/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";
import Role from "@/lib/models/Role";

export async function GET(
  req: NextRequest,
  { params }: { params: { vendorId: string } }
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

    // Get vendor products
    const products = await Product.find({ vendor: params.vendorId })
      .populate({ path: "collections", model: Collection })
      .sort({ createdAt: "desc" });

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

    const productData = await req.json();

    // Create new product
    const newProduct = await Product.create({
      ...productData,
      vendor: params.vendorId,
    });

    await newProduct.save();

    // Update collections if provided
    if (productData.collections) {
      for (const collectionId of productData.collections) {
        const collection = await Collection.findById(collectionId);
        if (collection && collection.vendor.toString() === params.vendorId) {
          collection.products.push(newProduct._id);
          await collection.save();
        }
      }
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor product:", error);
    return NextResponse.json(
      { error: "Failed to create vendor product" },
      { status: 500 }
    );
  }
}