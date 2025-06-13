// components/auth/PermissionGuard.tsx - FIXED VERSION
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
      // CRITICAL FIX: Wait for BOTH user and role to be fully loaded
      if (!isLoaded || roleLoading) {
        console.log("Waiting for auth/role to load...");
        return;
      }

      // CRITICAL FIX: Only proceed if user is authenticated
      if (!user) {
        console.log("No user found, redirecting to sign-in");
        router.replace("/sign-in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Checking permissions for user:", user.id, "role:", role);

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
          
          // CRITICAL FIX: Add proper error handling and authentication checks
          try {
            const response = await fetch("/api/vendors/my-vendor", {
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/json',
              },
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
              // CRITICAL FIX: Handle different error statuses gracefully
              console.error("Failed to fetch vendor data:", response.status, response.statusText);
              
              if (response.status === 401) {
                console.log("Unauthorized - redirecting to sign-in");
                router.replace("/sign-in");
                return;
              } else if (response.status === 403) {
                setError("You are not a vendor");
                setLoading(false);
                return;
              } else if (response.status === 404) {
                setError("Vendor account not found");
                setLoading(false);
                return;
              } else {
                setError("Unable to verify vendor permissions");
                setLoading(false);
                return;
              }
            }
          } catch (fetchError) {
            console.error("Network error while fetching vendor data:", fetchError);
            setError("Unable to verify permissions due to network error");
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

    // CRITICAL FIX: Only run when both user and role are loaded
    if (isLoaded && !roleLoading) {
      checkPermissions();
    }
  }, [isLoaded, roleLoading, user, role, isAdmin, isVendor, vendorId, requiredPermissions, router]);

  // CRITICAL FIX: Show loader while authentication is still loading
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