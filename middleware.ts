import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This fixes the Clerk auth issue while maintaining CORS functionality
export default authMiddleware({
  publicRoutes: ["/api/checkout", "/api/products", "/api/collections", "/api/search"],
  afterAuth(auth, req) {
    // Add CORS headers to all API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      const response = NextResponse.next();
      
      // Handle OPTIONS requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400', // 24 hours
          },
        });
      }

      // Add CORS headers to all other API responses
      response.headers.set('Access-Control-Allow-Origin', process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return response;
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};