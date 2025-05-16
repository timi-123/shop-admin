// components/debug/VendorDebug.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import { Button } from "@/components/ui/button";

const VendorDebug = () => {
  const { user } = useUser();
  const { role, isVendor } = useRole();
  const [vendorData, setVendorData] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  
  const fetchVendorData = async () => {
    try {
      const res = await fetch("/api/vendors/my-vendor");
      const data = await res.json();
      setVendorData(data);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      setVendorData({ error: "Failed to fetch vendor data" });
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={() => setVisible(!visible)}
        className="bg-gray-800 text-white"
      >
        {visible ? "Hide Debug" : "Vendor Debug"}
      </Button>
      
      {visible && (
        <div className="mt-2 p-4 bg-white border rounded shadow-lg w-80">
          <h3 className="font-bold mb-2">Vendor Debug Info</h3>
          <p><strong>User ID:</strong> {user?.id || "Not logged in"}</p>
          <p><strong>Role:</strong> {role || "Unknown"}</p>
          <p><strong>Is Vendor:</strong> {isVendor ? "Yes" : "No"}</p>
          <p><strong>Local Storage Vendor ID:</strong> {localStorage.getItem('vendorId') || "Not found"}</p>
          
          <Button 
            onClick={fetchVendorData}
            className="mt-2 bg-blue-500 text-white"
            size="sm"
          >
            Fetch Vendor Data
          </Button>
          
          {vendorData && (
            <div className="mt-2 p-2 bg-gray-100 rounded max-h-40 overflow-auto">
              <pre className="text-xs">{JSON.stringify(vendorData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDebug;