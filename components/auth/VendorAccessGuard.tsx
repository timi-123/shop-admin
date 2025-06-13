// components/auth/VendorAccessGuard.tsx - FIXED VERSION
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { usePathname } from "next/navigation";
import Loader from "@/components/custom ui/Loader";
import SuspendedVendorDashboard from "@/components/vendors/SuspendedVendorDashboard";

interface VendorAccessGuardProps {
  children: React.ReactNode;
}

const VendorAccessGuard: React.FC<VendorAccessGuardProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { role, isVendor, loading: roleLoading } = useRole();
  const pathname = usePathname();
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVendorStatus = async () => {
      // CRITICAL FIX: Only proceed if both user and role are loaded
      if (!isLoaded || roleLoading) {
        console.log("Waiting for auth/role to load in VendorAccessGuard...");
        return;
      }

      // CRITICAL FIX: Only fetch vendor data if user is authenticated and is a vendor
      if (!user || !isVendor) {
        console.log("User not authenticated or not a vendor, skipping vendor status check");
        setLoading(false);
        return;
      }

      try {
        console.log("Checking vendor status for user:", user.id);
        
        const response = await fetch("/api/vendors/my-vendor", {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const vendorData = await response.json();
          console.log("=== VENDOR ACCESS GUARD ===");
          console.log("Vendor data loaded:", vendorData);
          console.log("Vendor status:", vendorData.status);
          console.log("Appeal submitted:", vendorData.appealSubmitted);
          setVendor(vendorData);
        } else {
          // CRITICAL FIX: Handle error responses gracefully
          console.error("Failed to fetch vendor status:", response.status, response.statusText);
          
          if (response.status === 401) {
            console.log("Unauthorized - user may not be authenticated yet");
          } else if (response.status === 403) {
            console.log("User is not a vendor");
          } else if (response.status === 404) {
            console.log("Vendor not found");
          }
          // Don't set error state, just continue without vendor data
        }
      } catch (error) {
        console.error("Network error fetching vendor status:", error);
        // Don't set error state, just continue without vendor data
      } finally {
        setLoading(false);
      }
    };

    // CRITICAL FIX: Only run when both user and role are loaded
    if (isLoaded && !roleLoading) {
      checkVendorStatus();
    }
  }, [user, isVendor, isLoaded, roleLoading]);

  // Show loader while checking status
  if (!isLoaded || roleLoading || loading) {
    return <Loader />;
  }

  // If not a vendor or admin, let normal flow continue
  if (!isVendor && role !== "admin") {
    return <>{children}</>;
  }

  // If admin, always allow access
  if (role === "admin") {
    return <>{children}</>;
  }

  // If vendor is suspended, show suspended dashboard
  if (vendor?.status === "suspended") {
    return <SuspendedVendorDashboard />;
  }

  // If vendor is approved or for all other cases, show normal content
  return <>{children}</>;
};

export default VendorAccessGuard;