import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from "@clerk/nextjs";

// This handles CORS preflight requests
export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
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
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }

  return NextResponse.next();
}

// Apply the Clerk auth middleware after our CORS middleware
export default authMiddleware({
  publicRoutes: ["/api/:path*"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};