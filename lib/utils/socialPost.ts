import SocialPost from "@/lib/models/SocialPost";
import type { Document } from "mongoose";

// Use global types without import (declare in tsconfig or reference types.d.ts)

export function generateSocialPostContent(product: any, vendor: any) {
  return `Check out our new product: ${product.title}!\n\n${product.description}\n\nPrice: $${product.price}\n\nOrder now: ${process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001'}/products/${product._id}\n\n#${vendor.businessName.replace(/\s+/g, '')} #Shopgram`;
}

export async function createDemoSocialPosts(product: any, vendor: any) {
  const content = generateSocialPostContent(product, vendor);
  const platforms = ["instagram", "facebook"];
  const posts = [];
  for (const platform of platforms) {
    const post = await SocialPost.create({
      vendor: vendor._id,
      product: product._id,
      platform,
      content
    });
    posts.push(post);
  }
  return posts;
}
