// components/vendors/AppealDialog.tsx - Fixed transparent and made aesthetic
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
import { FileText, AlertTriangle, Send } from "lucide-react";
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
    if (!appealReason.trim()) {
      toast.error("Please provide a reason for your appeal");
      return;
    }

    if (appealReason.trim().length < 10) {
      toast.error("Appeal reason must be at least 10 characters long");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendor._id}/appeal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appealReason: appealReason.trim() }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit appeal");
      }

      toast.success("Appeal submitted successfully! We'll review it within 3-5 business days.", {
        duration: 4000,
        icon: "✅",
        style: {
          background: "#10B981",
          color: "white",
        },
      });
      
      setOpen(false);
      setAppealReason("");
      onAppealSubmitted();
      
    } catch (error: any) {
      console.error("Error submitting appeal:", error);
      toast.error(error.message || "Failed to submit appeal", {
        duration: 4000,
        icon: "❌",
        style: {
          background: "#EF4444",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          size="lg"
        >
          <FileText className="h-5 w-5 mr-2" />
          Submit Appeal
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-white border-0 shadow-2xl rounded-xl p-0 overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Submit Suspension Appeal
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-2">
              Help us understand why you believe this suspension should be lifted. 
              Please be honest and provide detailed information to support your case.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6 bg-white flex-1 overflow-y-auto">
          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Important Notice</h4>
                <p className="text-sm text-amber-700">
                  Your appeal will be carefully reviewed by our admin team. Please provide truthful and detailed information. 
                  False information may result in permanent account termination.
                </p>
              </div>
            </div>
          </div>

          {/* Suspension Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-red-800 mb-2">Current Suspension Details:</h4>
            <div className="space-y-1 text-sm">
              <p className="text-red-700">
                <span className="font-medium">Reason:</span> {vendor.suspendedReason || "No reason provided"}
              </p>
              <p className="text-red-700">
                <span className="font-medium">Date:</span> {vendor.suspendedAt ? new Date(vendor.suspendedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="appealReason" className="text-base font-semibold text-gray-800 mb-2 block">
                Why should this suspension be lifted? *
              </Label>
              <Textarea
                id="appealReason"
                placeholder="Please explain in detail:
• Why you believe the suspension was incorrect
• Any evidence or context that supports your case  
• What steps you've taken to address any issues
• Your commitment to following platform guidelines

Be specific and honest in your explanation..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                rows={8}
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className={`text-sm ${appealReason.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {appealReason.length}/500
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitAppeal}
              disabled={loading || !appealReason.trim() || appealReason.trim().length < 10}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Appeal
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppealDialog;