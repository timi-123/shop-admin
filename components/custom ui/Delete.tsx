"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Trash } from "lucide-react";
import { vendorCache } from "@/lib/services/vendorCache";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

interface DeleteProps {
  item: string;
  id: string;
  vendorId?: string;
  refreshData?: () => void;
}

const Delete: React.FC<DeleteProps> = ({ item, id, vendorId, refreshData }) => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {    try {
      setLoading(true);
      const itemType = item === "product" ? "products" : "collections";
      const res = await fetch(`/api/${itemType}/${id}`, {
        method: "DELETE",
      });
        if (res.ok) {
        setLoading(false);
        
        // Invalidate cache if vendorId and user are available
        if (vendorId && user) {
          vendorCache.invalidateVendorData(user.id, vendorId);
        }
        
        // Show success message first
        toast.success(`${item} deleted`);
        
        // Use custom refresh function if provided - this will update the data in place without navigation
        if (refreshData) {
          refreshData();
        } else {
          // Determine the correct page to navigate to
          const currentPath = window.location.pathname;
          
          if (currentPath.includes('/my-products')) {
            router.push('/my-products');
          } else if (currentPath.includes('/my-collections')) {
            router.push('/my-collections');
          } else if (currentPath.includes('/vendors/') && currentPath.includes('/products')) {
            // Keep on same vendor's products page
            router.refresh(); // Just refresh current page
          } else if (currentPath.includes('/vendors/') && currentPath.includes('/collections')) {
            // Keep on same vendor's collections page
            router.refresh(); // Just refresh current page
          } else {
            // Default fallback
            router.push(`/${itemType}`);
          }
        }
      }
    } catch (err) {
      console.log(err)
      toast.error("Something went wrong! Please try again.")
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button className="bg-red-1 text-white">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white text-grey-1">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-1">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {item}.
          </AlertDialogDescription>
        </AlertDialogHeader>        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-1 text-white" 
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Delete;
