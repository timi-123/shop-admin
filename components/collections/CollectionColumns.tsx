// components/collections/CollectionColumns.tsx - Updated with Vendor Column
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Delete from "../custom ui/Delete";
import Link from "next/link";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<CollectionType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/collections/${row.original._id}`}
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
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => <p>{row.original.products.length}</p>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge 
          className={isActive 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <Delete item="collection" id={row.original._id} />,
  },
];