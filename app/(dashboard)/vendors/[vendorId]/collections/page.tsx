// app/(dashboard)/vendors/[vendorId]/collections/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { Plus } from "lucide-react";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/collections/CollectionColumns";
import Link from "next/link";

const VendorCollectionsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { role, isAdmin, isVendor } = useRole();  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  
  const refreshCollections = async () => {
    if (!params.vendorId) return;
    
    try {
      setLoading(true);
      // Get vendor collections
      const collectionsRes = await fetch(`/api/vendors/${params.vendorId}/collections`, {
        cache: "no-store"
      });
      
      if (!collectionsRes.ok) {
        throw new Error("Failed to fetch collections");
      }
      
      const collectionsData = await collectionsRes.json();
      setCollections(collectionsData);
    } catch (error) {
      console.error("Error refreshing collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get vendor info
        const vendorRes = await fetch(`/api/vendors/${params.vendorId}`);
        if (!vendorRes.ok) {
          throw new Error("Failed to fetch vendor");
        }
        
        const vendorData = await vendorRes.json();
        setVendor(vendorData);
        
        // Check permissions
        if (!isAdmin && (!isVendor || vendorData.clerkId !== localStorage.getItem('userId'))) {
          router.push("/");
          return;
        }
        
        // Get vendor collections
        const collectionsRes = await fetch(`/api/vendors/${params.vendorId}/collections`);
        if (!collectionsRes.ok) {
          throw new Error("Failed to fetch collections");
        }
        
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.vendorId && (isAdmin || isVendor)) {
      fetchData();
    }
  }, [isAdmin, isVendor, params.vendorId, router]);

  if (loading) return <Loader />;
  
  if (!vendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Vendor not found</p>
        <p className="text-grey-1 mt-5">The vendor you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-heading2-bold">{vendor.businessName} - Collections</p>
          <Link href={`/vendors/${params.vendorId}`} className="text-blue-1 hover:underline">
            Back to vendor details
          </Link>
        </div>
        <Link href={`/vendors/${params.vendorId}/collections/new`}>
          <Button className="bg-blue-1 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Collection
          </Button>
        </Link>
      </div>
      <Separator className="bg-grey-1 my-4" />
        {collections.length === 0 ? (
        <p className="text-grey-1">No collections found for this vendor.</p>
      ) : (
        <DataTable columns={columns(refreshCollections)} data={collections} searchKey="title" />
      )}
    </div>
  );
};

export default VendorCollectionsPage;

// Add support for dynamic route
export const dynamic = "force-dynamic";