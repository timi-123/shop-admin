// app/api/products/route.ts - UPDATED to exclude products from suspended vendors
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();    const {
      title,
      description,
      media,
      collections,
      sizes,
      colors,
      price,
      vendor,
      stockQuantity
    } = await req.json();

    if (!title || !description || !media || !price || !vendor) {
      return new NextResponse("Not enough data to create a product", {
        status: 400,
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      media,
      collections,
      sizes,
      colors,
      price,
      vendor,
      stockQuantity: stockQuantity || 0
    });

    await newProduct.save();    if (collections && collections.length > 0) {
      console.log(`Adding new product ${newProduct._id} to ${collections.length} collections`);
      
      // Use updateMany with $addToSet to efficiently update collections and prevent duplicates
      await Collection.updateMany(
        { _id: { $in: collections } },
        { $addToSet: { products: newProduct._id } }
      );
      
      console.log(`Successfully added product to ${collections.length} collections`);
    }

    return NextResponse.json(newProduct, { status: 200 });
  } catch (err) {
    console.log("[products_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    // Get products and populate vendor info to check status
    const products = await Product.find()
      .sort({ createdAt: "desc" })
      .populate({ 
        path: "collections", 
        model: Collection 
      })
      .populate({ 
        path: "vendor", 
        model: Vendor,
        select: "businessName email _id status"
      });

    // Filter out products from suspended vendors for store display
    const storeProducts = products.filter(product => {
      // If vendor is populated and has status, check it
      if (product.vendor && typeof product.vendor === 'object' && 'status' in product.vendor) {
        return product.vendor.status === 'approved';
      }
      // If vendor is just an ID, we'll assume it's approved (shouldn't happen with populate)
      return true;
    });

    console.log(`Products API: Total ${products.length}, Store-visible: ${storeProducts.length}`);

    return NextResponse.json(storeProducts, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (err) {
    console.log("[products_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

// Add this new function for handling OPTIONS requests
export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const dynamic = "force-dynamic";