require('tsconfig-paths/register');
require('dotenv').config();
const Product = require('../lib/models/Product').default;
const Vendor = require('../lib/models/Vendor').default;
const SocialPost = require('../lib/models/SocialPost').default;
const { createDemoSocialPosts } = require('../lib/utils/socialPost');
const { connectToDB } = require('../lib/mongoDB');

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
