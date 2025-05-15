// app/(dashboard)/vendors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { vendorColumns } from "@/components/vendors/VendorColumns";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VendorsPage = () => {
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [pendingVendors, setPendingVendors] = useState<VendorType[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<VendorType[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        
        setVendors(data);
        setPendingVendors(data.filter((v: VendorType) => v.status === "pending"));
        setApprovedVendors(data.filter((v: VendorType) => v.status === "approved"));
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

  return (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Vendor Management</p>
      <Separator className="bg-grey-1 my-5" />
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingVendors.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedVendors.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Vendors ({vendors.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <DataTable 
            columns={vendorColumns} 
            data={pendingVendors} 
            searchKey="businessName"
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <DataTable 
            columns={vendorColumns} 
            data={approvedVendors} 
            searchKey="businessName"
          />
        </TabsContent>
        
        <TabsContent value="all">
          <DataTable 
            columns={vendorColumns} 
            data={vendors} 
            searchKey="businessName"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorsPage;