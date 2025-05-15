// app/(dashboard)/my-collections/page.tsx
"use client";

import { useEffect, useState } from "react";
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

const MyCollectionsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !isVendor) {
          router.push("/");
          return;
        }

        setLoading(true);
        
        // First get vendor info
        const vendorRes = await fetch("/api/vendors/my-vendor");
        if (!vendorRes.ok) {
          throw new Error("Failed to fetch vendor info");
        }
        
        const vendorData = await vendorRes.json();
        setVendor(vendorData);
        
        // Then get collections for this vendor
        const collectionsRes = await fetch(`/api/vendors/${vendorData._id}/collections`);
        if (!collectionsRes.ok) {
          throw new Error("Failed to fetch collections");
        }
        
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isVendor) {
      fetchData();
    }
  }, [user, isVendor, router]);

  if (!user || !isVendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Access Denied</p>
        <p className="text-grey-1 mt-5">Only vendors can access this page.</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">My Collections</p>
        {vendor && (
          <Link href={`/vendors/${vendor._id}/collections/new`}>
            <Button className="bg-blue-1 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </Link>
        )}
      </div>
      <Separator className="bg-grey-1 my-4" />
      
      {collections.length === 0 ? (
        <p className="text-grey-1">You don't have any collections yet.</p>
      ) : (
        <DataTable columns={columns} data={collections} searchKey="title" />
      )}
    </div>
  );
};

export default MyCollectionsPage;