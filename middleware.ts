// middleware.ts (Updated for admin dashboard)
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/api/checkout",
    "/api/products",
    "/api/collections",
    "/api/search",
    "/api/webhooks",
    "/api/vendors/public",
    "/api/vendors/public/(.*)",
    "/sign-in",
    "/sign-up",
    "/vendor-application"
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

    // Always allow sign-in, sign-up, and vendor application pages
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/vendor-application')) {
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