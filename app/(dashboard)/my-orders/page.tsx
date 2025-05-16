// app/(dashboard)/my-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orders/OrderColumns";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";

const MyOrdersPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [orders, setOrders] = useState([]);

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
        
        // Then get orders for this vendor
        const ordersRes = await fetch(`/api/vendors/${vendorData._id}/orders`);
        if (!ordersRes.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
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
      <p className="text-heading2-bold">My Orders</p>
      <Separator className="bg-grey-1 my-5"/>
      
      {orders.length === 0 ? (
        <p className="text-grey-1">You don't have any orders yet.</p>
      ) : (
        <DataTable columns={columns} data={orders} searchKey="_id" />
      )}
    </div>
  );
};

export default MyOrdersPage;