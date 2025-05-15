// app/(dashboard)/vendors/[vendorId]/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { Plus } from "lucide-react";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/products/ProductColumns";
import Link from "next/link";

const VendorProductsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [vendor, setVendor] = useState<VendorType | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchData = async () => {
      try {
        // Get vendor info
        const vendorRes = await fetch(`/api/vendors/${params.vendorId}`);
        const vendorData = await vendorRes.json();
        setVendor(vendorData);
        
        // Get vendor products
        const productsRes = await fetch(`/api/vendors/${params.vendorId}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, params.vendorId]);

  if (loading) return <Loader />;
  
  if (!isAdmin) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Access Denied</p>
        <p className="text-grey-1 mt-5">Only administrators can access this page.</p>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-heading2-bold">{vendor?.businessName} - Products</p>
          <Link href={`/vendors/${params.vendorId}`} className="text-blue-1 hover:underline">
            Back to vendor details
          </Link>
        </div>
        <Link href={`/vendors/${params.vendorId}/products/new`}>
          <Button className="bg-blue-1 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
      <Separator className="bg-grey-1 my-4" />
      <DataTable columns={columns} data={products} searchKey="title" />
    </div>
  );
};

export default VendorProductsPage;