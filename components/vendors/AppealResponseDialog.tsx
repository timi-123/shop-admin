// components/vendors/AppealResponseDialog.tsx - Fixed transparent and made aesthetic
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
import { CheckCircle, XCircle, MessageSquare, Calendar, User, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface AppealResponseDialogProps {
  vendor: VendorType;
  onResponseSent: () => void;
}

const AppealResponseDialog: React.FC<AppealResponseDialogProps> = ({ 
  vendor, 
  onResponseSent 
}) => {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [action, setAction] = useState<'approve' | 'reject'>('reject');
  const [loading, setLoading] = useState(false);

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error("Please provide a response");
      return;
    }

    if (response.trim().length < 10) {
      toast.error("Response must be at least 10 characters long");
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await fetch(`/api/vendors/${vendor._id}/appeal-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          response: response.trim(),
          action 
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        throw new Error(error.error || "Failed to send response");
      }

      const successMessage = action === 'approve' 
        ? "Appeal approved and vendor reinstated successfully!" 
        : "Appeal rejected successfully";
        
      toast.success(successMessage, {
        duration: 4000,
        icon: action === 'approve' ? "✅" : "📝",
        style: {
          background: action === 'approve' ? "#10B981" : "#6B7280",
          color: "white",
        },
      });
      
      setOpen(false);
      setResponse("");
      setAction('reject');
      onResponseSent();
    } catch (error: any) {
      console.error("Error sending response:", error);
      toast.error(error.message || "Failed to send response", {
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
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] bg-white border-0 shadow-2xl rounded-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Respond to Appeal
            </DialogTitle>
            <DialogDescription className="text-slate-200 mt-2">
              Review and respond to <strong>{vendor.businessName}</strong>'s suspension appeal
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 bg-white space-y-6">
          {/* Vendor Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Vendor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Business:</span>
                <span className="ml-2 text-gray-800">{vendor.businessName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-800">{vendor.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Suspended:</span>
                <span className="ml-2 text-gray-800">
                  {vendor.suspendedAt ? new Date(vendor.suspendedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className="ml-2 capitalize font-medium text-red-600">{vendor.status}</span>
              </div>
            </div>
          </div>

          {/* Suspension Reason */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Original Suspension Reason
            </h3>
            <p className="text-red-700 bg-red-100 p-3 rounded-md">
              {vendor.suspendedReason || 'No reason provided'}
            </p>
          </div>

          {/* Appeal Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Vendor's Appeal
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  Submitted: {vendor.appealSubmittedAt ? new Date(vendor.appealSubmittedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="bg-blue-100 p-3 rounded-md">
                <p className="text-blue-800 whitespace-pre-wrap">
                  {vendor.appealReason || 'No appeal reason provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Decision Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Admin Decision</h3>
            
            {/* Action Selection */}
            <div className="mb-4">
              <Label className="text-base font-medium text-gray-700 mb-3 block">
                Choose your decision:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    action === 'approve'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-6 w-6 ${action === 'approve' ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold text-gray-800">Approve Appeal</div>
                      <div className="text-sm text-gray-600">Restore vendor account</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    action === 'reject'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <XCircle className={`h-6 w-6 ${action === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold text-gray-800">Reject Appeal</div>
                      <div className="text-sm text-gray-600">Keep suspension active</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Response Text */}
            <div className="space-y-2">
              <Label htmlFor="response" className="text-base font-medium text-gray-700">
                Your response to the vendor: *
              </Label>
              <Textarea
                id="response"
                placeholder={action === 'approve' 
                  ? "Explain why the appeal is approved, any conditions for reinstatement, and next steps..."
                  : "Explain why the appeal is rejected, what the vendor needs to do differently, and any future considerations..."
                }
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={5}
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
                disabled={loading}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className={`text-sm ${response.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  {response.length}/1000
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
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
              onClick={handleSendResponse}
              disabled={loading || !response.trim() || response.trim().length < 10}
              className={`flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                action === 'approve' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {action === 'approve' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {action === 'approve' ? 'Approve Appeal' : 'Reject Appeal'}
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppealResponseDialog;