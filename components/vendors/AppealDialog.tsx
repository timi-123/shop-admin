// components/vendors/AppealDialog.tsx (Updated with debug logs)
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
import { FileText } from "lucide-react";
import toast from "react-hot-toast";

interface AppealDialogProps {
  vendor: VendorType;
  onAppealSubmitted: () => void;
}

const AppealDialog: React.FC<AppealDialogProps> = ({ 
  vendor, 
  onAppealSubmitted 
}) => {
  const [open, setOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitAppeal = async () => {
    console.log("=== APPEAL DIALOG DEBUG ===");
    console.log("Vendor ID:", vendor._id);
    console.log("Appeal reason:", appealReason);
    
    if (!appealReason.trim()) {
      toast.error("Please provide a reason for your appeal");
      return;
    }

    setLoading(true);
    try {
      console.log("Making API call to:", `/api/vendors/${vendor._id}/appeal`);
      
      const response = await fetch(`/api/vendors/${vendor._id}/appeal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appealReason: appealReason.trim() }),
      });

      console.log("API response status:", response.status);
      
      const responseData = await response.json();
      console.log("API response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit appeal");
      }

      toast.success("Appeal submitted successfully");
      setOpen(false);
      setAppealReason("");
      onAppealSubmitted();
    } catch (error: any) {
      console.error("Error submitting appeal:", error);
      toast.error(error.message || "Failed to submit appeal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <FileText className="h-4 w-4 mr-2" />
          Submit Appeal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Suspension Appeal</DialogTitle>
          <DialogDescription>
            Explain why you believe the suspension should be lifted. 
            Be honest and detailed in your explanation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="appealReason">Appeal Reason</Label>
            <Textarea
              id="appealReason"
              placeholder="Explain why you believe the suspension should be lifted..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={6}
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
            onClick={handleSubmitAppeal}
            disabled={loading || !appealReason.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Appeal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppealDialog;