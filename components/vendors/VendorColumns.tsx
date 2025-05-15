// components/vendors/VendorColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Ban } from "lucide-react";

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
      const status = row.original.status;
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        suspended: "bg-gray-100 text-gray-800",
      };
      
      return (
        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
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
                  // Handle approval
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
                  // Handle rejection
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
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-gray-100"
              onClick={() => {
                // Handle suspension
                const reason = prompt("Suspension reason:");
                if (reason) {
                  fetch(`/api/vendors/${vendor._id}/suspend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reason }),
                  }).then(() => window.location.reload());
                }
              }}
            >
              <Ban className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      );
    },
  },
];