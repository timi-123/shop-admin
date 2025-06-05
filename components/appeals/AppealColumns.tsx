// components/appeals/AppealColumns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import AppealResponseDialog from "../vendors/AppealResponseDialog";

export const appealColumns: ColumnDef<VendorType>[] = [
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
    accessorKey: "suspendedReason",
    header: "Suspension Reason",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <p className="text-sm text-gray-600 truncate" title={row.original.suspendedReason}>
          {row.original.suspendedReason || "No reason provided"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "appealReason",
    header: "Appeal Reason",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <p className="text-sm text-gray-600 truncate" title={row.original.appealReason}>
          {row.original.appealReason || "No appeal submitted"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "appealSubmittedAt",
    header: "Appeal Date",
    cell: ({ row }) => {
      return row.original.appealSubmittedAt
        ? new Date(row.original.appealSubmittedAt).toLocaleDateString()
        : "N/A";
    },
  },
  {
    accessorKey: "status",
    header: "Appeal Status",
    cell: ({ row }) => {
      const vendor = row.original;
      
      if (!vendor.appealSubmitted) {
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No Appeal
          </Badge>
        );
      }
      
      if (vendor.appealResponse) {
        return vendor.status === "approved" ? (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Appeal Approved
          </Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Appeal Rejected
          </Badge>
        );
      }
      
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Appeal Pending
        </Badge>
      );
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
          
          {vendor.appealSubmitted && !vendor.appealResponse && (
            <AppealResponseDialog vendor={vendor} onResponseSent={handleRefresh} />
          )}
          
          {vendor.appealResponse && (
            <Button
              size="sm"
              variant="outline"
              className="bg-gray-50"
              disabled
            >
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      );
    },
  },
];