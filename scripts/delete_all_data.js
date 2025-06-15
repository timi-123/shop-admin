// scripts/delete_all_data.js
// This script will delete ALL vendors, products, collections, and orders from the database
// USE WITH EXTREME CAUTION - THIS ACTION CANNOT BE UNDONE

const { mongoose } = require('mongoose');
require('dotenv').config();

// Import models once we connect
let Vendor, Product, Collection, Order;

// Connect to the database
async function connectToDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error("Missing MONGODB_URI environment variable");
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Now import models after connection
    try {
      // Attempt to import models from lib/models
      Vendor = require('../lib/models/Vendor').default;
      Product = require('../lib/models/Product').default;
      Collection = require('../lib/models/Collection').default;
      Order = require('../lib/models/Order').default;
    } catch (error) {
      console.error('Error importing models:', error);
      // Try importing without .default if first attempt fails
      try {
        Vendor = require('../lib/models/Vendor');
        Product = require('../lib/models/Product');
        Collection = require('../lib/models/Collection');
        Order = require('../lib/models/Order');
      } catch (err) {
        console.error('Failed to import models:', err);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function promptConfirmation() {
  const readline = require('readline');
  
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

async function deleteAllData() {
  try {
    console.log('Starting deletion process...');
    
    // Getting counts before deletion
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const collectionCount = await Collection.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Found ${vendorCount} vendors, ${productCount} products, ${collectionCount} collections, and ${orderCount} orders`);
    
    // Delete all records
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

async function main() {
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
