// app/(dashboard)/vendors/[vendorId]/collections/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import CollectionForm from "@/components/collections/CollectionForm";
import Loader from "@/components/custom ui/Loader";

const NewVendorCollectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { role, isAdmin, isVendor, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!isLoaded || roleLoading) return;
        
        setLoading(true);
        setError(null);
        
        // Make sure we have a vendorId
        if (!params.vendorId) {
          setError("Vendor ID is missing");
          setLoading(false);
          return;
        }
        
        console.log("Checking vendor permissions:", {
          vendorId: params.vendorId,
          isAdmin,
          isVendor,
          userId: user?.id
        });
        
        // Fetch vendor details to verify it exists
        const vendorRes = await fetch(`/api/vendors/${params.vendorId}`);
        if (!vendorRes.ok) {
          const errorData = await vendorRes.json();
          throw new Error(errorData.error || "Failed to fetch vendor");
        }
        
        const vendorData = await vendorRes.json();
        console.log("Vendor data:", vendorData);
        setVendor(vendorData);
        
        // For admin users, always allow
        if (isAdmin) {
          console.log("User is an admin - permission granted");
          setLoading(false);
          return;
        }
        
        // For vendor users, check if they own this vendor
        if (isVendor) {
          const isVendorOwner = vendorData.clerkId === user?.id;
          console.log("Vendor ownership check:", {
            vendorClerkId: vendorData.clerkId,
            userId: user?.id,
            isMatch: isVendorOwner
          });
          
          if (isVendorOwner) {
            console.log("User is the vendor owner - permission granted");
            setLoading(false);
            return;
          }
        }
        
        // If we get here, user doesn't have permission
        console.log("User does not have permission");
        setError("You don't have permission to create collections for this vendor");
        setLoading(false);
        
      } catch (error: any) {
        console.error("Error checking permissions:", error);
        setError(error.message || "An error occurred");
        setLoading(false);
      }
    };

    checkPermissions();
  }, [params.vendorId, isLoaded, roleLoading, isAdmin, isVendor, user?.id]);

  // Fix for when the user is not loaded yet or role is not determined
  if (!isLoaded || roleLoading) return <Loader />;
  
  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Error</p>
        <p className="text-grey-1 mt-5">{error}</p>
        <button 
          onClick={() => router.push(`/vendors/${params.vendorId}`)}
          className="mt-4 px-4 py-2 bg-blue-1 text-white rounded"
        >
          Back to Vendor
        </button>
      </div>
    );
  }
  
  if (!vendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Vendor not found</p>
        <p className="text-grey-1 mt-5">The vendor you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.push('/vendors')}
          className="mt-4 px-4 py-2 bg-blue-1 text-white rounded"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  // We've verified permissions, now render the form
  return <CollectionForm vendorId={params.vendorId as string} />;
};

export default NewVendorCollectionPage;