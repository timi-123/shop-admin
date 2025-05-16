// app/(dashboard)/my-products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/products/ProductColumns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import Link from "next/link";
import toast from "react-hot-toast";

const MyProductsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);

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
        
        // Store vendor ID for easy access across components
        if (vendorData && vendorData._id) {
          localStorage.setItem('vendorId', vendorData._id);
        }
        
        // Then get products for this vendor
        const productsRes = await fetch(`/api/vendors/${vendorData._id}/products`);
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }
        
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
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

  const handleCreateProduct = () => {
    const vendorId = vendor?._id || localStorage.getItem('vendorId');
    if (vendorId) {
      router.push(`/vendors/${vendorId}/products/new`);
    } else {
      toast.error("Vendor information not available. Please refresh the page.");
    }
  };

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between">
        <p className="text-heading2-bold">My Products</p>
        {vendor ? (
          <Link href={`/vendors/${vendor._id}/products/new`}>
            <Button className="bg-blue-1 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </Link>
        ) : (
          <Button 
            className="bg-blue-1 text-white"
            onClick={handleCreateProduct}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        )}
      </div>
      <Separator className="bg-grey-1 my-4" />
      
      {products.length === 0 ? (
        <p className="text-grey-1">You don't have any products yet.</p>
      ) : (
        <DataTable columns={columns} data={products} searchKey="title" />
      )}
    </div>
  );
};

export default MyProductsPage;