// app/(dashboard)/vendors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { vendorColumns } from "@/components/vendors/VendorColumns";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";

const VendorsPage = () => {
  const router = useRouter();
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        setVendors(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      }
    };

    fetchVendors();
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

  // Count vendors by status
  const pendingCount = vendors.filter(v => v.status === "pending").length;
  const approvedCount = vendors.filter(v => v.status === "approved").length;
  
  // Filter vendors based on status
  const filteredVendors = statusFilter === "all" 
    ? vendors 
    : vendors.filter(vendor => vendor.status === statusFilter);

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Vendor Management</p>
      <Separator className="bg-grey-1 my-5" />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">Pending Vendors</p>
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-green-800 font-semibold">Approved Vendors</p>
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">Total Vendors</p>
          <p className="text-2xl font-bold text-blue-700">{vendors.length}</p>
        </div>
      </div>
      
      {/* Simple filter dropdown - using standard HTML select */}
      <div className="mb-6">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All Vendors</option>
          <option value="pending">Pending Only</option>
          <option value="approved">Approved Only</option>
          <option value="rejected">Rejected Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>
      
      {/* Data Table */}
      <DataTable 
        columns={vendorColumns} 
        data={filteredVendors} 
        searchKey="businessName" 
      />
    </div>
  );
};

export default VendorsPage;