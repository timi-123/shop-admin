// components/vendors/SuspensionDialog.tsx (Wider version)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ban, AlertTriangle, User } from "lucide-react";
import toast from "react-hot-toast";

interface SuspensionDialogProps {
  vendor: VendorType;
  onSuspensionComplete: () => void;
}

const SuspensionDialog: React.FC<SuspensionDialogProps> = ({ 
  vendor, 
  onSuspensionComplete 
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendor._id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to suspend vendor");
      }

      toast.success("Vendor suspended successfully");
      setOpen(false);
      setReason("");
      onSuspensionComplete();
    } catch (error: any) {
      console.error("Error suspending vendor:", error);
      toast.error(error.message || "Failed to suspend vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-red-100 border-red-200"
        >
          <Ban className="h-4 w-4 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Suspend Vendor Account
          </DialogTitle>
          <DialogDescription className="text-red-700">
            This action will immediately disable all vendor functionalities for this account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Critical Action Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Critical Action</h4>
                <p className="text-red-700 text-sm mb-3">Suspending this vendor will immediately:</p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>Disable all vendor dashboard access</li>
                  <li>Hide their products from the store</li>
                  <li>Prevent new orders from being placed</li>
                  <li>Require admin approval to restore access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vendor Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-600" />
              <h4 className="font-semibold text-gray-800">Vendor Details</h4>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Business Name:</span>
                <span className="ml-2 text-gray-900">{vendor.businessName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{vendor.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Status:</span>
                <span className="ml-2 text-green-600 capitalize font-medium">{vendor.status}</span>
              </div>
            </div>
          </div>

          {/* Suspension Reason */}
          <div className="grid gap-3">
            <Label htmlFor="reason" className="text-base font-semibold">
              Suspension Reason <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">
              This reason will be visible to the vendor and used for appeal considerations.
            </p>
            <Textarea
              id="reason"
              placeholder="Enter the reason for suspension..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSuspend}
            disabled={loading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Suspending..." : "Suspend Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuspensionDialog;