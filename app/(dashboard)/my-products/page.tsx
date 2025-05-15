// app/(dashboard)/my-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/products/ProductColumns";

const MyProductsPage = () => {
  const router = useRouter();
  const { role, isVendor } = useRole();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [vendorData, setVendorData] = useState<VendorType | null>(null);

  useEffect(() => {
    if (!isVendor || !user) return;
    
    const fetchVendorData = async () => {
      try {
        // First get vendor info
        const vendorRes = await fetch("/api/vendors/my-vendor");
        const vendor = await vendorRes.json();
        setVendorData(vendor);
        
        // Then get vendor products
        const productsRes = await fetch(`/api/vendors/${vendor._id}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [isVendor, user]);

  if (loading) return <Loader />;
  
  if (!isVendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Access Denied</p>
        <p className="text-grey-1 mt-5">Only vendors can access this page.</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">My Products</p>
        {vendorData && (
          <Button
            className="bg-blue-1 text-white"
            onClick={() => router.push(`/vendors/${vendorData._id}/products/new`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        )}
      </div>
      <Separator className="bg-grey-1 my-4" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
};

export default MyProductsPage;