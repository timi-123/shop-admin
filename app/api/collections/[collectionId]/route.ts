import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";

export const GET = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    await connectToDB();

    // Find the collection and populate vendor information
    const collection = await Collection.findById(params.collectionId)
      .populate({ 
        path: "vendor", 
        select: "businessName email _id status"
      })
      .populate({ 
        path: "products", 
        model: Product 
      });

    if (!collection) {
      return new NextResponse(
        JSON.stringify({ message: "Collection not found" }),
        { status: 404 }
      );
    }

    // Import the utility function for accurate product count
    const { getCollectionProductCount } = await import("@/lib/utils/getCollectionProductCount");
    
    // Get the accurate product count
    const productCount = await getCollectionProductCount(params.collectionId);
    
    // Create a response object with the collection data and accurate product count
    const collectionResponse = {
      ...collection.toObject(),
      productCount: productCount !== -1 ? productCount : collection.products?.length || 0 // Fallback to products array length
    };

    // Add logging to diagnose the issue
    console.log(`Collection ${params.collectionId} product count: API=${productCount}, Collection array=${collection.products?.length || 0}`);

    return NextResponse.json(collectionResponse, { 
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (err) {
    console.log("[collectionId_GET]", err);
    return new NextResponse("Internal error", { status: 500 });
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

export const POST = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    let collection = await Collection.findById(params.collectionId);

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    const { title, description, image } = await req.json();

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 });
    }

    collection = await Collection.findByIdAndUpdate(
      params.collectionId,
      { title, description, image },
      { new: true }
    );

    await collection.save();

    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    console.log("[collectionId_POST]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    await Collection.findByIdAndDelete(params.collectionId);

    await Product.updateMany(
      { collections: params.collectionId },
      { $pull: { collections: params.collectionId } }
    );
    
    return new NextResponse("Collection is deleted", { status: 200 });
  } catch (err) {
    console.log("[collectionId_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
