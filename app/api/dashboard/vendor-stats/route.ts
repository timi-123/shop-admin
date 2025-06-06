// app/api/dashboard/vendor-stats/route.ts - Real Vendor-Specific Statistics
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Vendor from "@/lib/models/Vendor";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Find the vendor by clerkId
    const vendor = await Vendor.findOne({ clerkId: userId });
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Get vendor's products count
    const totalProducts = await Product.countDocuments({ vendor: vendor._id });

    // Get vendor's collections count
    const totalCollections = await Collection.countDocuments({ vendor: vendor._id });

    // Calculate vendor earnings (orders containing vendor's products)
    const vendorEarnings = await Order.aggregate([
      {
        $match: {
          "products.vendor": vendor._id
        }
      },
      {
        $unwind: "$products"
      },
      {
        $match: {
          "products.vendor": vendor._id
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $multiply: [
                { $ifNull: ["$products.priceAtTime", "$products.product.price"] },
                "$products.quantity"
              ]
            }
          }
        }
      }
    ]);

    // Calculate vendor earnings after platform commission (85% to vendor, 15% to platform)
    const grossEarnings = vendorEarnings[0]?.totalEarnings || 0;
    const netEarnings = grossEarnings * 0.85; // 85% goes to vendor

    // Count orders containing vendor's products
    const ordersWithVendorProducts = await Order.countDocuments({
      "products.vendor": vendor._id
    });

    return NextResponse.json({
      totalProducts,
      totalCollections,
      vendorEarnings: Math.round(netEarnings * 100) / 100,
      totalOrders: ordersWithVendorProducts
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendor statistics" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";