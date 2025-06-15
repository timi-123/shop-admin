// components/collections/CollectionColumns.tsx - Updated with Vendor Column
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Delete from "../custom ui/Delete";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";

type CollectionColumnProps = {
  refreshData?: () => void;
};

export const columns = (refreshData?: () => void): ColumnDef<CollectionType>[] => [
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
  },  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      // Using product count from collection.products would be inaccurate
      // Instead, we display the count from products that reference this collection
      const [productCount, setProductCount] = useState<number | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      
      useEffect(() => {
        const fetchProductCount = async () => {
          try {
            // Only fetch once when component mounts or collection ID changes
            setIsLoading(true);
            const res = await fetch(`/api/collections/${row.original._id}/product-count`);
            
            if (res.ok) {
              const data = await res.json();
              setProductCount(data.count);
            } else {
              // Fallback to collection.products.length if API fails
              setProductCount(Array.isArray(row.original.products) ? row.original.products.length : 0);
            }
          } catch (error) {
            console.error("Error fetching product count:", error);
            // Fallback to collection.products.length if API fails
            setProductCount(Array.isArray(row.original.products) ? row.original.products.length : 0);
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchProductCount();
      }, [row.original._id]);
      
      return (
        <p>
          {isLoading ? "..." : productCount !== null ? productCount : (Array.isArray(row.original.products) ? row.original.products.length : 0)}
        </p>
      );
    },
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
  },  {
    id: "actions",
    cell: ({ row }) => {
      // Get the vendor ID from the collection - can be string or object
      const vendorId = typeof row.original.vendor === 'string' 
        ? row.original.vendor 
        : row.original.vendor?._id;
        
      return (
        <Delete 
          item="collection" 
          id={row.original._id}
          vendorId={vendorId}
          refreshData={refreshData}
        />
      );
    },
  },
];