// app/(dashboard)/vendors/[vendorId]/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import Loader from "@/components/custom ui/Loader";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orders/OrderColumns";
import Link from "next/link";

const VendorOrdersPage = () => {
  const params = useParams();
  const router = useRouter();
  const { role, isAdmin, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vendor, setVendor] = useState<VendorType | null>(null);

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
        
        // Get vendor orders
        const ordersRes = await fetch(`/api/vendors/${params.vendorId}/orders`);
        if (!ordersRes.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
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
      <div className="mb-4">
        <p className="text-heading2-bold">{vendor.businessName} - Orders</p>
        <Link href={`/vendors/${params.vendorId}`} className="text-blue-1 hover:underline">
          Back to vendor details
        </Link>
      </div>
      <Separator className="bg-grey-1 my-4" />
      
      {orders.length === 0 ? (
        <p className="text-grey-1">No orders found for this vendor.</p>
      ) : (
        <DataTable columns={columns} data={orders} searchKey="_id" />
      )}
    </div>
  );
};

export default VendorOrdersPage;

// Add support for dynamic route
export const dynamic = "force-dynamic";