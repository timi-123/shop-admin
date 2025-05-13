import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Handle CORS properly while maintaining Clerk Auth
export default authMiddleware({
  publicRoutes: [
    "/api/checkout",
    "/api/products",
    "/api/collections",
    "/api/search",
    "/api/webhooks", // Make sure webhooks are public
    "/sign-in",
    "/sign-up"
  ],
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;

    // Handle CORS for API routes
    if (pathname.startsWith('/api')) {
      const response = NextResponse.next();

      if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      response.headers.set('Access-Control-Allow-Origin', process.env.ECOMMERCE_STORE_URL || 'http://localhost:3001');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;
    }

    // Always allow sign-in and sign-up pages
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      return NextResponse.next();
    }

    // If user is not authenticated, redirect to sign-in
    if (!auth.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // For authenticated users, let them through
    // RoleGuard component will handle role checking
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};