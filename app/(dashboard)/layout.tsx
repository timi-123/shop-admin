// app/(dashboard)/layout.tsx (FIXED VERSION)
"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import { ClerkProvider, useUser } from "@clerk/nextjs";
import LeftSideBar from "@/components/layout/LeftSideBar";
import TopBar from "@/components/layout/TopBar";
import { ToasterProvider } from "@/lib/ToasterProvider";
import RoleGuard from "@/components/auth/RoleGuard";
import { useRole } from "@/lib/hooks/useRole";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Inner component that has access to Clerk context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { role, loading: roleLoading } = useRole();
  const pathname = usePathname();

  // Show loading state
  if (!isLoaded || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page layout (no sidebar/topbar) ONLY for:
  // 1. Non-authenticated users on root page
  // 2. Regular users on root page only (not vendor application)
  const showLandingLayout = !user || (role === "user" && pathname === "/");

  if (showLandingLayout) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Show dashboard layout (with sidebar/topbar) for:
  // 1. All authenticated admin/vendor users
  // 2. Regular users on vendor-application page
  // 3. Any authenticated user on any page except root
  return (
    <div className="flex max-lg:flex-col text-grey-1">
      <LeftSideBar />
      <TopBar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ToasterProvider />
          <RoleGuard>
            <LayoutContent>
              {children}
            </LayoutContent>
          </RoleGuard>
        </body>
      </html>
    </ClerkProvider>
  );
}