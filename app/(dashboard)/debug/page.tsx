// app/(dashboard)/debug/page.tsx
"use client";

import { useRole } from "@/lib/hooks/useRole";
import { Separator } from "@/components/ui/separator";
import RoleGuard from "@/components/auth/RoleGuard";
import DeleteAllData from "@/components/debug/DeleteAllData";
import Loader from "@/components/custom ui/Loader";
import VendorDebug from "@/components/debug/VendorDebug";
import RepairCollections from "@/components/debug/RepairCollections";
import FixCollectionCounts from "@/components/debug/FixCollectionCounts";
import FixPlatformFees from "@/components/debug/FixPlatformFees";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Shield } from "lucide-react";

export default function DebugPage() {
  const { loading } = useRole();
  const router = useRouter();

  if (loading) {
    return <Loader />;
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="px-10 py-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-heading2-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              Admin Debug Tools
            </h1>
            <p className="text-body-medium text-grey-2">
              Advanced tools for system maintenance - Use with caution
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Debug Actions
              </CardTitle>
              <CardDescription>
                System maintenance and debug tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                These tools are intended for system administrators only. Use with extreme caution as some
                actions cannot be undone.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Components */}        <div className="grid grid-cols-1 gap-8">          {/* Vendor Debug Tools */}
          <VendorDebug />
          
          {/* Collection Repair Tools */}
          <RepairCollections />
            {/* Fix Collection Counts */}
          <FixCollectionCounts />
          
          {/* Update Platform Fees */}
          <FixPlatformFees />

          {/* Delete All Data */}
          <DeleteAllData />
        </div>
      </div>
    </RoleGuard>
  );
}
