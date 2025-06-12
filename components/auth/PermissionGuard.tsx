// components/auth/PermissionGuard.tsx (STREAMLINED)
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { useRouter } from "next/navigation";
import Loader from "@/components/custom ui/Loader";

interface PermissionGuardProps {
  children: React.ReactNode;
  vendorId?: string;
  requiredPermissions?: string[];
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  vendorId,
  requiredPermissions = ["vendor", "admin"]
}) => {
  const { user, isLoaded } = useUser();
  const { role, isAdmin, isVendor, loading: roleLoading } = useRole();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      // Wait for authentication and role to be loaded
      if (!isLoaded || roleLoading) return;

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Admin has access to everything
        if (isAdmin) {
          console.log("Admin user - access granted");
          setHasPermission(true);
          setLoading(false);
          return;
        }

        // Check if user has required role
        if (!requiredPermissions.includes(role || "")) {
          console.log("User role not in required permissions:", role, requiredPermissions);
          setError("You don't have permission to access this page");
          setLoading(false);
          return;
        }

        // If vendor ID is specified, check vendor ownership
        if (vendorId && isVendor) {
          console.log("Checking vendor ownership for vendorId:", vendorId);
          
          const response = await fetch("/api/vendors/my-vendor", {
            cache: 'no-store'
          });
          
          if (response.ok) {
            const vendorData = await response.json();
            console.log("My vendor data:", vendorData);
            
            if (vendorData._id !== vendorId) {
              console.log("Vendor ID mismatch:", vendorData._id, "vs", vendorId);
              setError("You can only access your own vendor data");
              setLoading(false);
              return;
            }
            
            console.log("Vendor ownership verified");
          } else {
            console.error("Failed to fetch vendor data:", response.status);
            setError("Unable to verify vendor permissions");
            setLoading(false);
            return;
          }
        }

        setHasPermission(true);
      } catch (error) {
        console.error("Permission check failed:", error);
        setError("Permission check failed");
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [isLoaded, roleLoading, user, role, isAdmin, isVendor, vendorId, requiredPermissions, router]);

  if (!isLoaded || roleLoading || loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="px-10 py-5">
        <div className="text-center">
          <h1 className="text-heading2-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-grey-1 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="px-10 py-5">
        <div className="text-center">
          <h1 className="text-heading2-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-grey-1 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;