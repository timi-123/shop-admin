// app/api/collections/[collectionId]/product-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import { getCollectionProductCount } from "@/lib/utils/getCollectionProductCount";

export async function GET(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    if (!params.collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    // Get the accurate product count using the utility function
    const count = await getCollectionProductCount(params.collectionId);
    
    if (count === -1) {
      // Error occurred in the utility function
      return NextResponse.json({ error: "Error getting product count" }, { status: 500 });
    }
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[collection_product_count_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
