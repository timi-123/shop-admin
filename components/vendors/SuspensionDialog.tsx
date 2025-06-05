// components/vendors/SuspensionDialog.tsx
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
import { Ban } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Suspend Vendor</DialogTitle>
          <DialogDescription>
            You are about to suspend <strong>{vendor.businessName}</strong>.
            This will disable all their functionalities. Please provide a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Suspension Reason</Label>
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
        <DialogFooter>
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
            variant="destructive"
            onClick={handleSuspend}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Suspending..." : "Suspend Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuspensionDialog;