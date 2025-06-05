// components/auth/VendorAccessGuard.tsx
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
      if (!isLoaded || roleLoading || !user || !isVendor) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/vendors/my-vendor");
        if (response.ok) {
          const vendorData = await response.json();
          setVendor(vendorData);
        }
      } catch (error) {
        console.error("Error fetching vendor status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkVendorStatus();
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