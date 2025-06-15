// scripts/delete_all_data.ts
// This script will delete ALL vendors, products, collections, and orders from the database
// USE WITH EXTREME CAUTION - THIS ACTION CANNOT BE UNDONE

import mongoose from 'mongoose';
import { config } from 'dotenv';
import readline from 'readline';

// Load environment variables
config();

// Models will be imported after connection
let Vendor: any, Product: any, Collection: any, Order: any;

// Connect to the database
async function connectToDB(): Promise<void> {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error("Missing MONGODB_URI environment variable");
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Import models after connection
    try {
      // Attempt to import models
      Vendor = (await import('../lib/models/Vendor')).default;
      Product = (await import('../lib/models/Product')).default;
      Collection = (await import('../lib/models/Collection')).default;
      Order = (await import('../lib/models/Order')).default;
    } catch (error) {
      console.error('Error importing models:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function promptConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\x1b[31m%s\x1b[0m', '⚠️ WARNING: This will PERMANENTLY DELETE ALL vendors, products, collections, and orders!');
    console.log('\x1b[31m%s\x1b[0m', '⚠️ This action CANNOT be undone!');
    
    rl.question('Type "DELETE ALL DATA" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === "DELETE ALL DATA");
    });
  });
}

async function deleteAllData(): Promise<void> {
  try {
    console.log('Starting deletion process...');
    
    // Get counts before deletion
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const collectionCount = await Collection.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Found ${vendorCount} vendors, ${productCount} products, ${collectionCount} collections, and ${orderCount} orders`);
    
    // Delete all records in order of dependencies
    console.log('Deleting orders...');
    const deletedOrders = await Order.deleteMany({});
    
    console.log('Deleting products...');
    const deletedProducts = await Product.deleteMany({});
    
    console.log('Deleting collections...');
    const deletedCollections = await Collection.deleteMany({});
    
    console.log('Deleting vendors...');
    const deletedVendors = await Vendor.deleteMany({});
    
    console.log('\x1b[32m%s\x1b[0m', '✅ Deletion complete!');
    console.log(`Deleted ${deletedVendors.deletedCount} vendors`);
    console.log(`Deleted ${deletedProducts.deletedCount} products`);
    console.log(`Deleted ${deletedCollections.deletedCount} collections`);
    console.log(`Deleted ${deletedOrders.deletedCount} orders`);
    
  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function main(): Promise<void> {
  await connectToDB();
  
  const confirmed = await promptConfirmation();
  
  if (confirmed) {
    await deleteAllData();
  } else {
    console.log('\x1b[33m%s\x1b[0m', 'Operation cancelled. No data was deleted.');
    await mongoose.disconnect();
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
