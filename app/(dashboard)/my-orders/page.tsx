// app/(dashboard)/my-orders/page.tsx (IMPROVED)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orders/OrderColumns";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import toast from "react-hot-toast";

const MyOrdersPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState<string | null>(null);
  // Make fetchData accessible at component level for retry button
  const fetchData = async () => {
      try {
        if (!user || !isVendor) {
          console.log("User not authenticated or not a vendor, staying on page...");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        console.log("Fetching vendor info...");
        
        // First get vendor info
        const vendorRes = await fetch("/api/vendors/my-vendor", {
          cache: 'no-store'
        });
        
        if (!vendorRes.ok) {
          const errorData = await vendorRes.json();
          throw new Error(errorData.error || "Failed to fetch vendor info");
        }
        
        const vendorData = await vendorRes.json();
        console.log("Vendor data received:", vendorData);
        setVendor(vendorData);
        
        console.log("Fetching orders for vendor:", vendorData._id);
        
        // Then get orders for this vendor
        const ordersRes = await fetch(`/api/vendors/${vendorData._id}/orders`, {
          cache: 'no-store'
        });
        
        if (!ordersRes.ok) {
          const errorData = await ordersRes.json();
          throw new Error(errorData.error || "Failed to fetch orders");
        }
        
        const ordersData = await ordersRes.json();
        console.log("Orders data received:", ordersData);
        setOrders(ordersData);
        
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.message || "Failed to load orders");
        toast.error(error.message || "Failed to load orders");      } finally {
        setLoading(false);
      }
    };
    
  // Use effect to call fetchData on component mount
  useEffect(() => {
    if (user && isVendor) {
      fetchData();
    }
  }, [user, isVendor, router]);

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
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">My Orders</p>
      <Separator className="bg-grey-1 my-5"/>
      
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-grey-1">You don't have any orders yet.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} searchKey="_id" />
      )}
    </div>
  );
};

export default MyOrdersPage;