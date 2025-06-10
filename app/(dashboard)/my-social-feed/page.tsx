// Force model registration in Next.js app directory
type _ForceModelHack = typeof import("@/lib/models/Product") & typeof import("@/lib/models/Vendor") & typeof import("@/lib/models/SocialPost");
require("@/lib/models/Product");
require("@/lib/models/Vendor");
require("@/lib/models/SocialPost");

// Import models first to ensure schema registration
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";
import SocialPost from "@/lib/models/SocialPost";
import Image from "next/image";
import Link from "next/link";
import { connectToDB } from "@/lib/mongoDB";

export default async function MySocialFeedPage() {
  await connectToDB();
  const posts = await SocialPost.find({})
    .populate("product")
    .populate("vendor")
    .sort({ createdAt: -1 });

  // Group by product, show only one post per product (latest)
  const uniquePostsMap = new Map();
  for (const post of posts) {
    if (!uniquePostsMap.has(post.product?._id?.toString())) {
      uniquePostsMap.set(post.product?._id?.toString(), post);
    }
  }
  const uniquePosts = Array.from(uniquePostsMap.values());

  return (
    <div className="px-10 py-5">
      <h1 className="text-heading2-bold mb-6">Social Feed</h1>
      <p className="mb-8 text-grey-2">This is a demo feed of posts that would be sent to social media. Each product appears only once.</p>
      {uniquePosts.length === 0 ? (
        <p className="text-grey-1">No posts yet. Create a product to see posts here.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {uniquePosts.map((post: any) => (
            <div key={post._id} className="bg-white border rounded-lg shadow flex flex-col w-full">
              {post.product?.media?.[0] && (
                <div className="relative w-full h-56 bg-grey-1 flex items-center justify-center rounded-t-lg">
                  <Image
                    src={post.product.media[0]}
                    alt={post.product.title}
                    fill
                    className="object-contain rounded-t-lg"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-pink-600 capitalize">{post.vendor?.businessName}</span>
                  <span className="text-xs text-grey-2">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-lg font-semibold line-clamp-1">
                  {post.product?.title}
                </div>
                <div className="text-base text-black mt-2 mb-2 whitespace-pre-line line-clamp-4">
                  {post.content &&
                    post.content
                      .replace(/Order now:[^\n]*/gi, "")
                      .replace(/View Product[^\n]*/gi, "")
                      .replace(/View Vendor[^\n]*/gi, "")
                      .trim()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
