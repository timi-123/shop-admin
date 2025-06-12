// app/(dashboard)/my-products/page.tsx (FIXED - Using Cache Service)
"use client";

import { useEffect, useState, useRef } from "react";
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
import { vendorCache } from "@/lib/services/vendorCache";

const MyProductsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      // Prevent duplicate requests
      if (fetchingRef.current) {
        console.log("Products fetch already in progress, skipping");
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
        
        // Store vendor ID for easy access across components
        if (vendorData && vendorData._id) {
          localStorage.setItem('vendorId', vendorData._id);
        }
        
        console.log("Fetching products using cache service...");
        
        // Use cache service for products data
        const productsData = await vendorCache.getVendorData(user.id, vendorData._id, 'products');
        console.log("Products data received:", productsData);
        setProducts(productsData);
        
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError(error.message || "Failed to load products");
        toast.error(error.message || "Failed to load products");
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
        <button
          onClick={() => {
            // Clear cache and retry
            vendorCache.clearCache(user.id);
            window.location.reload();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleCreateProduct = () => {
    const vendorId = vendor?._id || localStorage.getItem('vendorId');
    if (vendorId) {
      console.log("Navigating to create product for vendor:", vendorId);
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
      <Separator className="bg-grey-1 my-5"/>
      
      {products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-grey-1 mb-4">You don't have any products yet.</p>
          {vendor ? (
            <Link href={`/vendors/${vendor._id}/products/new`}>
              <Button className="bg-blue-1 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Product
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={handleCreateProduct}
              className="bg-blue-1 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Product
            </Button>
          )}
        </div>
      ) : (
        <DataTable columns={columns} data={products} searchKey="title" />
      )}
    </div>
  );
};

export default MyProductsPage;