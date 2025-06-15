// components/products/ProductColumns.tsx - Updated with Vendor Column
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Delete from "../custom ui/Delete";
import Link from "next/link";
import { Badge } from "../ui/badge";

type ProductColumnProps = {
  refreshData?: () => void;
};

export const columns = (refreshData?: () => void): ColumnDef<ProductType>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/products/${row.original._id}`}
        className="hover:text-red-1"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => {
      const vendor = row.original.vendor;
      
      // Handle populated vendor data
      if (typeof vendor === 'object' && vendor !== null) {
        return (
          <Link
            href={`/vendors/${vendor._id}`}
            className="hover:text-blue-600 transition-colors duration-200"
          >
            <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
              {vendor.businessName}
            </div>
          </Link>
        );
      }
      
      // If vendor is just an ID string
      if (typeof vendor === 'string') {
        return (
          <Link
            href={`/vendors/${vendor}`}
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            View Vendor Details
          </Link>
        );
      }
      
      return (
        <span className="text-gray-400 font-medium">No vendor assigned</span>
      );
    },
  },
  {
    accessorKey: "collections",
    header: "Collections",
    cell: ({ row }) => row.original.collections.map((collection) => collection.title).join(", "),
  },
  {
    accessorKey: "price",
    header: "Price ($)",
  },
  {
    accessorKey: "isApproved",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.original.isApproved;
      return (
        <Badge 
          className={isApproved 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
          }
        >
          {isApproved ? "Approved" : "Pending"}
        </Badge>
      );
    },
  },  {
    id: "actions",
    cell: ({ row }) => {
      // Get the vendor ID from the product - can be string or object
      const vendorId = typeof row.original.vendor === 'string' 
        ? row.original.vendor 
        : row.original.vendor?._id;
      
      return (
        <Delete 
          item="product" 
          id={row.original._id}
          vendorId={vendorId} 
          refreshData={refreshData}
        />
      );
    },
  },
];