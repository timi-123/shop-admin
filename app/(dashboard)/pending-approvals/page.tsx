// app/(dashboard)/pending-approvals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { vendorColumns } from "@/components/vendors/VendorColumns";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";

const PendingApprovalsPage = () => {
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [pendingVendors, setPendingVendors] = useState<VendorType[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchPendingVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        
        // Filter only pending vendors
        const pending = data.filter((v: VendorType) => v.status === "pending");
        setPendingVendors(pending);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending vendors:", error);
        setLoading(false);
      }
    };

    fetchPendingVendors();
  }, [isAdmin]);

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
      <p className="text-heading2-bold">Pending Vendor Approvals</p>
      <Separator className="bg-grey-1 my-5" />
      
      {pendingVendors.length === 0 ? (
        <p className="text-body-medium text-grey-1">No pending approvals</p>
      ) : (
        <DataTable 
          columns={vendorColumns} 
          data={pendingVendors} 
          searchKey="businessName"
        />
      )}
    </div>
  );
};

export default PendingApprovalsPage;