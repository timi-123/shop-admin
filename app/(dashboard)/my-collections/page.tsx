// app/(dashboard)/my-collections/page.tsx (COMPLETE FIXED - Single Export)
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/collections/CollectionColumns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import Link from "next/link";
import toast from "react-hot-toast";
import { vendorCache } from "@/lib/services/vendorCache";

const MyCollectionsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  // Refreshes collection data from cache or API
  const refreshCollections = async () => {
    if (user && vendor) {
      vendorCache.invalidateVendorData(user.id, vendor._id);
      setLoading(true);
      setError(null);
      try {
        const collectionsData = await vendorCache.getVendorData(user.id, vendor._id, 'collections');
        setCollections(collectionsData);
      } catch (error: any) {
        setError(error.message || "Failed to load collections");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Prevent duplicate requests
      if (fetchingRef.current) {
        console.log("Collections fetch already in progress, skipping");
        return;
      }

      try {
        if (!user || !isVendor) {
          console.log("User not authenticated or not a vendor, staying on page...");
          setLoading(false);
          return;
        }

        fetchingRef.current = true;
        setLoading(true);
        setError(null);
        
        console.log("Fetching vendor info using cache service...");
        
        // Use cache service for vendor data
        const vendorData = await vendorCache.getVendor(user.id);
        console.log("Vendor data received:", vendorData);
        setVendor(vendorData);
        
        // Store vendor ID for easy access
        if (vendorData && vendorData._id) {
          localStorage.setItem('vendorId', vendorData._id);
        }
        
        console.log("Fetching collections using cache service...");
        
        // Use cache service for collections data
        const collectionsData = await vendorCache.getVendorData(user.id, vendorData._id, 'collections');
        console.log("Collections data received:", collectionsData);
        setCollections(collectionsData);
        
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        setError(error.message || "Failed to load collections");
        toast.error(error.message || "Failed to load collections");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    // Only fetch if user and role are loaded
    if (user && isVendor) {
      fetchData();
    } else if (user && role && role !== "vendor") {
      setLoading(false);
    }

    // Cleanup
    return () => {
      fetchingRef.current = false;
    };
  }, [user?.id, isVendor]);

  // Show early return for access control
  if (!user || !isVendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Access Denied</p>
        <p className="text-grey-1 mt-5">Only vendors can access this page.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold text-red-600">Error</p>
        <p className="text-grey-1 mt-5">{error}</p>
        <button          onClick={() => {
            // Clear cache and retry with client-side refresh
            vendorCache.clearCache(user.id);
            setLoading(true);
            refreshCollections();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleCreateCollection = () => {
    const vendorId = vendor?._id || localStorage.getItem('vendorId');
    if (vendorId) {
      console.log("Navigating to create collection for vendor:", vendorId);
      router.push(`/vendors/${vendorId}/collections/new`);
    } else {
      toast.error("Vendor information not available. Please refresh the page.");
    }
  };

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">My Collections</p>
        {vendor ? (
          <Link href={`/vendors/${vendor._id}/collections/new`}>
            <Button className="bg-blue-1 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </Link>
        ) : (
          <Button 
            className="bg-blue-1 text-white"
            onClick={handleCreateCollection}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        )}
      </div>
      <Separator className="bg-grey-1 my-5"/>
      
      {collections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-grey-1 mb-4">You don't have any collections yet.</p>
          {vendor ? (
            <Link href={`/vendors/${vendor._id}/collections/new`}>
              <Button className="bg-blue-1 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Collection
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleCreateCollection}
              className="bg-blue-1 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
            </Button>
          )}
        </div>
      ) : (
        <DataTable columns={columns(refreshCollections)} data={collections} searchKey="title" />
      )}
    </div>
  );
};

export default MyCollectionsPage;