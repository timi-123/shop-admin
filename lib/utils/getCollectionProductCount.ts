// lib/utils/getCollectionProductCount.ts
import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";

/**
 * Gets the accurate product count for a collection by querying products directly
 * This is more reliable than using the collection.products.length
 * 
 * @param collectionId The ID of the collection
 * @returns The number of products in the collection
 */
export async function getCollectionProductCount(collectionId: string): Promise<number> {
  try {
    await connectToDB();
    
    // Count products that have this collection in their collections array
    const productCount = await Product.countDocuments({
      collections: collectionId
    });
    
    return productCount;
  } catch (error) {
    console.error(`Error getting product count for collection ${collectionId}:`, error);
    // Return -1 to indicate an error
    return -1;
  }
}

/**
 * Updates a collection's product array to match what's in the products collection
 * 
 * @param collectionId The ID of the collection to update
 * @returns Object with success status and count of fixed products
 */
export async function repairCollectionProducts(collectionId: string): Promise<{
  success: boolean;
  productsAdded: number;
  productsRemoved: number;
  totalProducts: number;
}> {
  try {
    await connectToDB();
    
    // Find the collection
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }
    
    // Find all products that reference this collection
    const productsWithThisCollection = await Product.find({
      collections: collectionId
    });    // Create sets for comparison
    const productsInCollectionSet = new Set<string>(
      collection.products.map((p: any) => p.toString())
    );
    
    const productsReferencingCollection = new Set<string>(
      productsWithThisCollection.map((p: any) => p._id.toString())
    );
    
    // Find products to add and remove
    const productsToAdd = Array.from(productsReferencingCollection)
      .filter(p => !productsInCollectionSet.has(p));
    
    const productsToRemove = Array.from(productsInCollectionSet)
      .filter(p => !productsReferencingCollection.has(p));
    
    // Update the collection
    if (productsToAdd.length > 0) {
      await Collection.findByIdAndUpdate(collectionId, {
        $addToSet: { products: { $each: productsToAdd } }
      });
    }
    
    if (productsToRemove.length > 0) {
      await Collection.findByIdAndUpdate(collectionId, {
        $pull: { products: { $in: productsToRemove } }
      });
    }
    
    return {
      success: true,
      productsAdded: productsToAdd.length,
      productsRemoved: productsToRemove.length,
      totalProducts: productsReferencingCollection.size
    };
  } catch (error) {
    console.error(`Error repairing collection ${collectionId}:`, error);
    return {
      success: false,
      productsAdded: 0,
      productsRemoved: 0,
      totalProducts: 0
    };
  }
}
