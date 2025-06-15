// app/api/debug/repair-collections/route.ts - Repair collection product counts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";

// Define interfaces for type safety
interface RepairResult {
  collectionsProcessed: number;
  productsFixed: number;
  productsAdded: number;
  productsRemoved: number;
  collectionsWithChanges: number;
  details: CollectionChangeDetail[];
}

interface CollectionChangeDetail {
  collectionId: string;
  collectionName: string;
  productsAdded: number;
  productsRemoved: number;
  productsAfterRepair: number;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    // Only allow admins
    if (!userId || !process.env.ADMIN_EMAILS?.split(',').includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
      // Step 1: Get all collections
    const collections = await Collection.find();
    console.log(`Found ${collections.length} collections to repair`);
    
    const results: RepairResult = {
      collectionsProcessed: 0,
      productsFixed: 0,
      productsAdded: 0,
      productsRemoved: 0,
      collectionsWithChanges: 0,
      details: []
    };
    
    // Step 2: Process each collection
    for (const collection of collections) {
      results.collectionsProcessed++;
      const collectionId = collection._id.toString();
        // Get products that reference this collection
      const productsWithThisCollection = await Product.find({
        collections: collectionId
      });
      
      // Create sets for efficient comparison
      const productsInCollectionSet = new Set(collection.products.map((p: any) => p.toString()));
      const productsReferencingCollection = new Set(productsWithThisCollection.map((p: any) => p._id.toString()));
      
      // Find products to add (in product references but missing from collection)
      const productsToAdd = Array.from(productsReferencingCollection).filter((p) => !productsInCollectionSet.has(p));
      
      // Find products to remove (in collection but not referencing it)
      const productsToRemove = Array.from(productsInCollectionSet).filter((p) => !productsReferencingCollection.has(p));
      
      // Track changes
      results.productsAdded += productsToAdd.length;
      results.productsRemoved += productsToRemove.length;
      
      // If changes needed, update the collection
      if (productsToAdd.length > 0 || productsToRemove.length > 0) {
        results.collectionsWithChanges++;
        
        // Add products that should be in the collection
        if (productsToAdd.length > 0) {
          await Collection.findByIdAndUpdate(collectionId, {
            $addToSet: { products: { $each: productsToAdd } }
          });
        }
        
        // Remove products that shouldn't be in the collection
        if (productsToRemove.length > 0) {
          await Collection.findByIdAndUpdate(collectionId, {
            $pull: { products: { $in: productsToRemove } }
          });
        }
        
        // Record details of the changes
        results.details.push({
          collectionId,
          collectionName: collection.title,
          productsAdded: productsToAdd.length,
          productsRemoved: productsToRemove.length,
          productsAfterRepair: productsReferencingCollection.size
        });      }
    }
    
    // Calculate total fixes
    results.productsFixed = results.productsAdded + results.productsRemoved;
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error in repair-collections:", error);
    return NextResponse.json(
      { error: "Failed to repair collections", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
