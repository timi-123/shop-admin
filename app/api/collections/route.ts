// app/api/collections/route.ts - UPDATED to exclude collections from suspended vendors
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    await connectToDB()

    const { title, description, image } = await req.json()

    const existingCollection = await Collection.findOne({ title })

    if (existingCollection) {
      return new NextResponse("Collection already exists", { status: 400 })
    }

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 })
    }

    const newCollection = await Collection.create({
      title,
      description,
      image,
    })

    await newCollection.save()

    return NextResponse.json(newCollection, { status: 200 })
  } catch (err) {
    console.log("[collections_POST]", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    // Get collections and populate vendor info to check status
    const collections = await Collection.find()
      .sort({ createdAt: "desc" })
      .populate({ 
        path: "vendor", 
        model: Vendor,
        select: "businessName email _id status"
      });

    // Filter out collections from suspended vendors for store display
    const storeCollections = collections.filter(collection => {
      // If vendor is populated and has status, check it
      if (collection.vendor && typeof collection.vendor === 'object' && 'status' in collection.vendor) {
        return collection.vendor.status === 'approved';
      }
      // If vendor is just an ID, we'll assume it's approved (shouldn't happen with populate)
      return true;
    });

    // Import the utility function for accurate product count
    const { getCollectionProductCount } = await import("@/lib/utils/getCollectionProductCount");
    
    // Add accurate product counts to each collection
    const collectionsWithCounts = await Promise.all(storeCollections.map(async (collection) => {
      const productCount = await getCollectionProductCount(collection._id.toString());
      
      // Create a response object with accurate product count
      return {
        ...collection.toObject(),
        productCount: productCount !== -1 ? productCount : collection.products?.length || 0
      };
    }));

    console.log(`Collections API: Total ${collections.length}, Store-visible: ${collectionsWithCounts.length}`);

    return NextResponse.json(collectionsWithCounts, { 
      status: 200, 
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (err) {
    console.log("[collections_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
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