// app/(dashboard)/vendors/[vendorId]/products/new/page.tsx - COMPLETE FIX
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import ProductForm from "@/components/products/ProductForm";
import Loader from "@/components/custom ui/Loader";

interface NewVendorProductPageProps {
  params: { vendorId: string };
}

const NewVendorProductPage: React.FC<NewVendorProductPageProps> = ({ params }) => {
  const { user, isLoaded } = useUser();
  const { role, isAdmin, isVendor, loading: roleLoading } = useRole();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [vendor, setVendor] = useState<VendorType | null>(null);

  useEffect(() => {
    const checkPermissionsAndLoadPage = async () => {
      // Wait for authentication to fully load
      if (!isLoaded || roleLoading) {
        console.log("Waiting for auth to load...");
        return;
      }

      // Redirect if not authenticated
      if (!user) {
        console.log("No user found, redirecting to sign-in");
        router.replace("/sign-in");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Checking permissions for product creation:", {
          vendorId: params.vendorId,
          userId: user.id,
          role,
          isAdmin,
          isVendor
        });

        // Admin has access to everything
        if (isAdmin) {
          console.log("Admin user - access granted immediately");
          setHasPermission(true);
          setLoading(false);
          return;
        }

        // Check if user is a vendor
        if (!isVendor) {
          console.log("User is not a vendor");
          setError("You must be a vendor to create products");
          setLoading(false);
          return;
        }

        // For vendors, verify they own this vendor account
        console.log("Verifying vendor ownership...");
        
        try {
          const response = await fetch("/api/vendors/my-vendor", {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const vendorData = await response.json();
            console.log("Vendor data loaded:", vendorData);
            
            // Check if this vendor ID matches the user's vendor
            if (vendorData._id !== params.vendorId) {
              console.log("Vendor ID mismatch:", vendorData._id, "vs", params.vendorId);
              setError("You can only create products for your own vendor account");
              setLoading(false);
              return;
            }
            
            console.log("Vendor ownership verified");
            setVendor(vendorData);
            setHasPermission(true);
          } else {
            // Handle API errors gracefully
            console.error("Failed to verify vendor ownership:", response.status);
            
            if (response.status === 401) {
              console.log("Unauthorized - redirecting to sign-in");
              router.replace("/sign-in");
              return;
            } else if (response.status === 403) {
              setError("You are not a vendor");
            } else if (response.status === 404) {
              setError("Vendor account not found");
            } else {
              setError("Unable to verify vendor permissions");
            }
            setLoading(false);
            return;
          }
        } catch (fetchError) {
          console.error("Network error during vendor verification:", fetchError);
          setError("Network error - please check your connection and try again");
          setLoading(false);
          return;
        }

      } catch (error) {
        console.error("Permission check failed:", error);
        setError("Failed to verify permissions");
      } finally {
        setLoading(false);
      }
    };

    // Only run when authentication is fully loaded
    if (isLoaded && !roleLoading) {
      checkPermissionsAndLoadPage();
    }
  }, [isLoaded, roleLoading, user, role, isAdmin, isVendor, params.vendorId, router]);

  // Show loader while checking permissions
  if (!isLoaded || roleLoading || loading) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-8">
          <Loader />
          <p className="mt-4 text-gray-600">Loading product creation page...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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

  // Show the product form if user has permission
  if (hasPermission) {
    return (
      <div className="px-10 py-5">
        <div className="mb-6">
          <h1 className="text-heading2-bold">Create New Product</h1>
          {vendor && (
            <p className="text-body-medium text-grey-2">
              Creating product for: {vendor.businessName}
            </p>
          )}
        </div>
        <ProductForm vendorId={params.vendorId} isAdmin={isAdmin} />
      </div>
    );
  }

  // Fallback loader
  return <Loader />;
};

export default NewVendorProductPage;