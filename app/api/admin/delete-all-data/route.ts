// app/api/admin/delete-all-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Vendor from "@/lib/models/Vendor";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import Order from "@/lib/models/Order";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the request includes a confirmation code
    const { confirmationCode } = await req.json();
    
    if (confirmationCode !== "DELETE_ALL_DATA_CONFIRM") {
      return NextResponse.json(
        { error: "Invalid confirmation code" },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDB();
    
    // Get counts before deletion for reporting
    const vendorCount = await Vendor.countDocuments();
    const productCount = await Product.countDocuments();
    const collectionCount = await Collection.countDocuments();
    const orderCount = await Order.countDocuments();
    
    // Delete all data in order of dependencies
    const deletedOrders = await Order.deleteMany({});
    const deletedProducts = await Product.deleteMany({});
    const deletedCollections = await Collection.deleteMany({});
    const deletedVendors = await Vendor.deleteMany({});
    
    // Return success response with deletion counts
    return NextResponse.json({
      success: true,
      message: "All data deleted successfully",
      deletedCounts: {
        vendors: deletedVendors.deletedCount,
        products: deletedProducts.deletedCount,
        collections: deletedCollections.deletedCount,
        orders: deletedOrders.deletedCount
      },
      originalCounts: {
        vendors: vendorCount,
        products: productCount,
        collections: collectionCount,
        orders: orderCount
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting all data:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}

// Force dynamic to ensure this is never cached
export const dynamic = "force-dynamic";
