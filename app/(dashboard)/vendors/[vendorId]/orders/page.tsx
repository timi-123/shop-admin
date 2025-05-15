// app/(dashboard)/vendors/[vendorId]/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import Loader from "@/components/custom ui/Loader";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orders/OrderColumns";
import Link from "next/link";

const VendorOrdersPage = () => {
  const params = useParams();
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [vendor, setVendor] = useState<VendorType | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchData = async () => {
      try {
        // Get vendor info
        const vendorRes = await fetch(`/api/vendors/${params.vendorId}`);
        const vendorData = await vendorRes.json();
        setVendor(vendorData);
        
        // Get vendor orders
        const ordersRes = await fetch(`/api/vendors/${params.vendorId}/orders`);
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
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
      <div className="mb-4">
        <p className="text-heading2-bold">{vendor?.businessName} - Orders</p>
        <Link href={`/vendors/${params.vendorId}`} className="text-blue-1 hover:underline">
          Back to vendor details
        </Link>
      </div>
      <Separator className="bg-grey-1 my-4" />
      <DataTable columns={columns} data={orders} searchKey="_id" />
    </div>
  );
};

export default VendorOrdersPage;