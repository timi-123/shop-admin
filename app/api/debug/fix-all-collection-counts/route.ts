// app/api/debug/fix-all-collection-counts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    // Only allow admins
    if (!userId || !process.env.ADMIN_EMAILS?.split(',').includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    
    // Get all collections
    const collections = await Collection.find();
    console.log(`Found ${collections.length} collections to update product counts`);
      interface MismatchDetail {
      collectionId: string;
      collectionName: string;
      storedCount: number;
      actualCount: number;
      difference: number;
    }
    
    const results = {
      collectionsUpdated: 0,
      collectionsWithMismatch: 0,
      mismatchDetails: [] as MismatchDetail[]
    };
    
    // Process each collection to check for count mismatches
    for (const collection of collections) {
      const collectionId = collection._id.toString();
      
      // Get the actual count of products that reference this collection
      const actualProductCount = await Product.countDocuments({ 
        collections: collectionId 
      });
      
      // Get the collection's products array length
      const collectionProductsLength = collection.products?.length || 0;
      
      // Check if there's a mismatch
      if (actualProductCount !== collectionProductsLength) {
        results.collectionsWithMismatch++;
        
        // Record the mismatch details
        results.mismatchDetails.push({
          collectionId,
          collectionName: collection.title,
          storedCount: collectionProductsLength,
          actualCount: actualProductCount,
          difference: actualProductCount - collectionProductsLength
        });
        
        // Find all products that reference this collection
        const productsWithCollection = await Product.find({ 
          collections: collectionId 
        });
        
        // Update the collection's products array to match exactly
        await Collection.findByIdAndUpdate(collectionId, {
          products: productsWithCollection.map(p => p._id)
        });
        
        results.collectionsUpdated++;
      }
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in fix-all-collection-counts:", error);
    return NextResponse.json(
      { error: "Failed to fix collection counts", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

// Ensure this endpoint is not cached
export const dynamic = "force-dynamic";
