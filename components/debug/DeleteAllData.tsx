// components/debug/DeleteAllData.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";

const DeleteAllData = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { role } = useRole();
  
  // Only admin can use this component
  if (role !== "admin") {
    return null;
  }

  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      toast.error("Please type the confirmation text correctly");
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch("/api/admin/delete-all-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationCode: "DELETE_ALL_DATA_CONFIRM",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("All data deleted successfully");
        setOpen(false);
        setConfirmText("");
        
        // Show detailed toast with counts
        toast.success(
          `Deleted: ${result.deletedCounts.vendors} vendors, ${result.deletedCounts.products} products, ${result.deletedCounts.collections} collections, ${result.deletedCounts.orders} orders`,
          { duration: 5000 }
        );
        
        // Refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        toast.error(`Failed to delete data: ${result.error}`);
      }
    } catch (error) {
      toast.error("An error occurred while deleting data");
      console.error("Error deleting data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-red-600">
          Delete all vendors, products, collections, and orders from the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-800 mb-4">
          This action will permanently delete ALL data from the database. 
          This includes all vendors, products, collections, and orders. 
          This action cannot be undone.
        </p>
      </CardContent>
      <CardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-red-300">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">⚠️ WARNING: This action cannot be undone</AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4">
                  <p className="text-red-600 font-medium">
                    You are about to permanently delete ALL data from the database:
                  </p>
                  <ul className="list-disc pl-5 text-red-600 space-y-1">
                    <li>All vendors</li>
                    <li>All products</li>
                    <li>All collections</li>
                    <li>All orders</li>
                  </ul>
                  <div className="bg-red-100 p-3 rounded-md border border-red-300">
                    <p className="text-red-800 font-medium">
                      To confirm, please type "DELETE ALL DATA" in the field below:
                    </p>
                    <Input 
                      className="mt-2 bg-white border-red-300"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE ALL DATA to confirm"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAllData();
                }}
                disabled={isDeleting || confirmText !== "DELETE ALL DATA"}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Data
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default DeleteAllData;
