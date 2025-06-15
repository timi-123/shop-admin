// scripts/fix_collection_product_counts.js
/**
 * This script updates all collections to have accurate product counts
 * It repairs the bidirectional relationship between products and collections
 * to ensure external sites display the correct number of products
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || 'test';

async function main() {
  if (!uri) {
    console.error('MONGODB_URI environment variable not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const collectionsCollection = db.collection('collections');
    const productsCollection = db.collection('products');
    
    // Get all collections
    const collections = await collectionsCollection.find({}).toArray();
    console.log(`Found ${collections.length} collections to process`);
    
    let fixedCount = 0;
    for (const collection of collections) {
      // For each collection, find all products that reference it
      const productsCount = await productsCollection.countDocuments({
        collections: collection._id
      });
      
      // Find all products in collection's products array
      const collectionProductIds = collection.products || [];
      
      // Get all products that should be in this collection
      const productsWithCollection = await productsCollection.find({
        collections: collection._id
      }).toArray();
      
      const productsWithCollectionIds = productsWithCollection.map(p => p._id.toString());
      
      // Calculate products to add and remove
      const productsToAdd = productsWithCollection
        .filter(p => !collectionProductIds.some(id => id.toString() === p._id.toString()))
        .map(p => p._id);
      
      const productsToRemove = collectionProductIds
        .filter(id => !productsWithCollectionIds.includes(id.toString()));
      
      // Update the collection's products array if needed
      let needsUpdate = false;
      let updateOps = {};
      
      if (productsToAdd.length > 0) {
        updateOps.$addToSet = { products: { $each: productsToAdd } };
        needsUpdate = true;
      }
      
      if (productsToRemove.length > 0) {
        updateOps.$pull = { products: { $in: productsToRemove } };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await collectionsCollection.updateOne({ _id: collection._id }, updateOps);
        fixedCount++;
        
        console.log(`Fixed collection "${collection.title}"`);
        console.log(` - Added ${productsToAdd.length} products`);
        console.log(` - Removed ${productsToRemove.length} products`);
        console.log(` - Correct product count: ${productsCount}`);
        console.log(` - Previous products array length: ${collectionProductIds.length}`);
        console.log('------------------------');
      }
    }
    
    console.log(`Fixed ${fixedCount} collections out of ${collections.length} total`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);
