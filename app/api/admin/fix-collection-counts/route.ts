// app/api/admin/fix-collection-counts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { getRoleFromEmail } from "@/lib/roleConfig";

export async function GET(req: NextRequest) {
  try {
    const session = auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    // Authorization - only admins can run this
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = await getRoleFromEmail(session.sessionClaims?.email as string);
    
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    // Get all collections
    const collections = await Collection.find();
    console.log(`Found ${collections.length} collections to process`);

    const results = [];
    let fixedCount = 0;

    for (const collection of collections) {
      // For each collection, find all products that reference it
      const productsWithThis = await Product.find({
        collections: collection._id
      });
      
      // Get all product IDs in collection's products array
      const collectionProductIds = collection.products?.map((id: any) => id.toString()) || [];
      
      // Get all product IDs that should be in this collection
      const productsWithCollectionIds = productsWithThis.map(p => p._id.toString());
      
      // Calculate products to add and remove
      const productsToAdd = productsWithThis
        .filter(p => !collectionProductIds.includes(p._id.toString()))
        .map(p => p._id);
        const productsToRemove = collectionProductIds
        .filter((id: string) => !productsWithCollectionIds.includes(id));
      
      // Update the collection's products array if needed
      let updated = false;
      
      if (productsToAdd.length > 0) {
        await Collection.findByIdAndUpdate(collection._id, {
          $addToSet: { products: { $each: productsToAdd } }
        });
        updated = true;
      }
      
      if (productsToRemove.length > 0) {
        await Collection.findByIdAndUpdate(collection._id, {
          $pull: { products: { $in: productsToRemove } }
        });
        updated = true;
      }
      
      if (updated) {
        fixedCount++;
        
        results.push({
          collectionId: collection._id,
          title: collection.title,
          productsAdded: productsToAdd.length,
          productsRemoved: productsToRemove.length,
          finalProductCount: productsWithThis.length
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      fixedCollections: fixedCount,
      totalCollections: collections.length,
      results
    });
  } catch (error) {
    console.error("[fix_collection_counts_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
