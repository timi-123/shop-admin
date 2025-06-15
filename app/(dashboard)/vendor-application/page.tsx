// app/(dashboard)/vendor-application/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRole } from "@/lib/hooks/useRole";
import VendorApplicationForm from "@/components/vendors/VendorApplicationForm";
import Loader from "@/components/custom ui/Loader";
import Link from "next/link";

const VendorApplicationPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();
  const [existingApplication, setExistingApplication] = useState<VendorType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      if (role === "admin" || role === "vendor") {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("/api/vendors/my-application");
        if (res.ok) {
          const data = await res.json();
          setExistingApplication(data);
        }
      } catch (error) {
        console.error("Error checking application:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && !roleLoading) {
      checkExistingApplication();
    }
  }, [user, isLoaded, role, roleLoading, router]);

  if (!isLoaded || roleLoading || loading) {
    return <Loader />;
  }

  if (existingApplication) {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-gray-100 text-gray-800",
    };

    return (
      <div className="px-10 py-5">
        <h1 className="text-heading2-bold mb-4">Vendor Application Status</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <span className="text-grey-1">Status: </span>
            <span className={`px-3 py-1 rounded-full text-sm ${statusColors[existingApplication.status]}`}>
              {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
            </span>
          </div>
          
          <p className="text-body-medium mb-2">
            <span className="font-semibold">Business Name:</span> {existingApplication.businessName}
          </p>
          
          <p className="text-body-medium mb-2">
            <span className="font-semibold">Applied on:</span> {new Date(existingApplication.createdAt).toLocaleDateString()}
          </p>
          
          {existingApplication.status === "rejected" && existingApplication.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-body-medium text-red-800">
                <span className="font-semibold">Rejection Reason:</span> {existingApplication.rejectionReason}
              </p>
            </div>
          )}
          
          {existingApplication.status === "pending" && (
            <p className="text-body-medium text-grey-1 mt-4">
              Your application is being reviewed. We'll notify you once a decision is made.
            </p>
          )}
            {existingApplication.status === "approved" && (
            <div className="mt-4 space-y-4">
              <p className="text-body-medium text-green-600">
                Congratulations! Your vendor application has been approved. You can now start adding products.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/debug/set-vendor-role", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                      });
                      
                      if (res.ok) {
                        // Clear cached role
                        if (user?.id) {
                          localStorage.removeItem(`role_${user.id}`);
                          localStorage.removeItem(`lastRoleFetch_${user.id}`);
                          localStorage.removeItem(`role_cache_time_${user.id}`);
                        }
                        
                        // Force refresh
                        window.location.href = "/?roleFixed=true";
                      } else {
                        const error = await res.text();
                        alert("Error fixing role: " + error);
                      }
                    } catch (error) {
                      console.error("Error fixing role:", error);
                      alert("Error fixing role. Check console for details.");
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Fix My Vendor Access
                </button>
                  <Link href="/?fixRole=true" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center">
                  Fix My Role & Access Dashboard
                </Link>
                
                <Link href="/my-products/new" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-center">
                  Add New Product
                </Link>
                
                <Link href="/my-collections/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center">
                  Create New Collection
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <VendorApplicationForm />;
};

export default VendorApplicationPage;