// app/(dashboard)/appeals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/hooks/useRole";
import { DataTable } from "@/components/custom ui/DataTable";
import { appealColumns } from "@/components/appeals/AppealColumns";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/custom ui/Loader";
import { AlertTriangle, Clock, MessageSquare, Users } from "lucide-react";

const AppealsPage = () => {
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState<VendorType[]>([]);
  const [stats, setStats] = useState({
    totalAppeals: 0,
    pendingAppeals: 0,
    respondedAppeals: 0,
  });

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchAppeals = async () => {
      try {
        const res = await fetch("/api/appeals");
        const data = await res.json();
        
        setAppeals(data);
        
        // Calculate stats
        const pendingCount = data.filter((vendor: VendorType) => 
          vendor.appealSubmitted && !vendor.appealResponse
        ).length;
        
        const respondedCount = data.filter((vendor: VendorType) => 
          vendor.appealResponse
        ).length;

        const totalWithAppeals = data.filter((vendor: VendorType) => 
          vendor.appealSubmitted || vendor.appealResponse
        ).length;
        
        setStats({
          totalAppeals: totalWithAppeals,
          pendingAppeals: pendingCount,
          respondedAppeals: respondedCount,
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appeals:", error);
        setLoading(false);
      }
    };

    fetchAppeals();
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
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600" />
        <p className="text-heading2-bold">Appeals Management</p>
      </div>
      
      <Separator className="bg-grey-1 my-5" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appeals</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppeals}</div>
            <p className="text-xs text-muted-foreground">
              Vendors who submitted appeals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appeals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAppeals}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for admin response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.respondedAppeals}</div>
            <p className="text-xs text-muted-foreground">
              Appeals with admin response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appeals Table */}
      {appeals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">No Suspended Vendors</p>
            <p className="text-gray-500 text-center">
              There are currently no suspended vendors in the system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Suspended Vendors</h3>
            <Badge variant="outline" className="text-sm">
              {appeals.length} suspended vendor{appeals.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <DataTable 
            columns={appealColumns} 
            data={appeals} 
            searchKey="businessName"
          />
        </div>
      )}
    </div>
  );
};

export default AppealsPage;