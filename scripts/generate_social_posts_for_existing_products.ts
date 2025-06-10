import mongoose from "mongoose";
import "dotenv/config";
import Product from "../lib/models/Product";
import Vendor from "../lib/models/Vendor";
import SocialPost from "../lib/models/SocialPost";
import { createDemoSocialPosts } from "../lib/utils/socialPost";
import { connectToDB } from "../lib/mongoDB";

// Fix for ts-node path aliases
require('tsconfig-paths/register');

async function main() {
  await connectToDB();
  const products = await Product.find({});
  let createdCount = 0;
  for (const product of products) {
    // Check if posts already exist for this product
    const existing = await SocialPost.findOne({ product: product._id });
    if (existing) continue;
    const vendor = await Vendor.findById(product.vendor);
    if (!vendor) continue;
    await createDemoSocialPosts(product, vendor);
    createdCount++;
    console.log(`Created demo social posts for product: ${product.title}`);
  }
  console.log(`Done. Created posts for ${createdCount} products.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
