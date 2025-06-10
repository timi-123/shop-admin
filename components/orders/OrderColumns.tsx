"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => (
      <Link href={`/orders/${row.getValue("_id")}`} className="hover:text-red-1">
        {String(row.getValue("_id")).slice(-8)}
      </Link>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => row.getValue("customerName") || "N/A",
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      const products = row.getValue("products") as any[];
      return products?.length || 0;
    },
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    cell: ({ row }) => `${Number(row.getValue("subtotal") || 0).toFixed(2)}`,
  },
  {
    accessorKey: "commission",
    header: "Platform Fee",
    cell: ({ row }) => `${Number(row.getValue("commission") || 0).toFixed(2)}`,
  },
  {
    accessorKey: "vendorEarnings",
    header: "Your Earnings",
    cell: ({ row }) => (
      <span className="text-green-600 font-medium">
        ${Number(row.getValue("vendorEarnings") || 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === "pending" ? "bg-yellow-100 text-yellow-800" :
          status === "processing" ? "bg-blue-100 text-blue-800" :
          status === "shipped" ? "bg-purple-100 text-purple-800" :
          status === "delivered" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {status || "pending"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
];