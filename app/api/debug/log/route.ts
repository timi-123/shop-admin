// app/api/debug/log/route.ts
import { NextRequest, NextResponse } from "next/server";

// This is a simple API endpoint to log debug information
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("DEBUG LOG:", JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error logging debug information:", error);
    return NextResponse.json({ error: "Failed to log debug information" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";