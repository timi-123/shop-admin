// components/vendors/VendorColumns.tsx (Updated)
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Ban, RotateCcw } from "lucide-react";
import SuspensionDialog from "./SuspensionDialog";
import AppealResponseDialog from "./AppealResponseDialog";

export const vendorColumns: ColumnDef<VendorType>[] = [
  {
    accessorKey: "businessName",
    header: "Business Name",
    cell: ({ row }) => (
      <Link
        href={`/vendors/${row.original._id}`}
        className="hover:text-blue-1 font-medium"
      >
        {row.original.businessName}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const vendor = row.original;
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        suspended: "bg-gray-100 text-gray-800",
      };
      
      return (
        <div className="flex flex-col gap-1">
          <Badge className={statusColors[vendor.status]}>
            {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
          </Badge>
          {vendor.appealSubmitted && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              Appeal Pending
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied On",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const vendor = row.original;
      
      const handleRefresh = () => {
        window.location.reload();
      };
      
      return (
        <div className="flex gap-2">
          <Link href={`/vendors/${vendor._id}`}>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          
          {vendor.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-green-100"
                onClick={() => {
                  fetch(`/api/vendors/${vendor._id}/approve`, {
                    method: "POST",
                  }).then(() => window.location.reload());
                }}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-red-100"
                onClick={() => {
                  const reason = prompt("Rejection reason:");
                  if (reason) {
                    fetch(`/api/vendors/${vendor._id}/reject`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reason }),
                    }).then(() => window.location.reload());
                  }
                }}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
          
          {vendor.status === "approved" && (
            <SuspensionDialog vendor={vendor} onSuspensionComplete={handleRefresh} />
          )}
          
          {vendor.status === "suspended" && (
            <>
              {vendor.appealSubmitted && (
                <AppealResponseDialog vendor={vendor} onResponseSent={handleRefresh} />
              )}
              
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-green-100"
                onClick={() => {
                  fetch(`/api/vendors/${vendor._id}/unsuspend`, {
                    method: "POST",
                  }).then(() => window.location.reload());
                }}
              >
                <RotateCcw className="h-4 w-4 text-green-600" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];