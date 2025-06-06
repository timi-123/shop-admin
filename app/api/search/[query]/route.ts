// app/api/search/[query]/route.ts - UPDATED to exclude products from suspended vendors
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { query: string }}) => {
  try {
    await connectToDB()

    // First find products matching the search criteria and populate vendor info
    const searchedProducts = await Product.find({
      $or: [
        { title: { $regex: params.query, $options: "i" } },
        { category: { $regex: params.query, $options: "i" } },
        { tags: { $in: [new RegExp(params.query, "i")] } }
      ]
    }).populate({
      path: "vendor",
      model: Vendor,
      select: "businessName status"
    });

    // Filter out products from suspended vendors
    const approvedVendorProducts = searchedProducts.filter(product => {
      if (product.vendor && typeof product.vendor === 'object' && 'status' in product.vendor) {
        return product.vendor.status === 'approved';
      }
      return true; // If no vendor info, assume approved (shouldn't happen)
    });

    console.log(`Search API: Found ${searchedProducts.length} products, ${approvedVendorProducts.length} from approved vendors`);

    return NextResponse.json(approvedVendorProducts, { status: 200 })
  } catch (err) {
    console.log("[search_GET]", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const dynamic = "force-dynamic";