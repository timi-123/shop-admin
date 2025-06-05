// components/vendors/AppealResponseDialog.tsx
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
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
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

      toast.success(`Appeal ${action}d successfully`);
      setOpen(false);
      setResponse("");
      setAction('reject');
      onResponseSent();
    } catch (error: any) {
      console.error("Error sending response:", error);
      toast.error(error.message || "Failed to send response");
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
          className="hover:bg-blue-100 border-blue-200"
        >
          <MessageSquare className="h-4 w-4 text-blue-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Respond to Appeal</DialogTitle>
          <DialogDescription>
            <strong>{vendor.businessName}</strong> has submitted an appeal for their suspension.
          </DialogDescription>
        </DialogHeader>
        
        {/* Display the appeal */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Appeal Reason:</h4>
          <p className="text-sm text-gray-700">{vendor.appealReason}</p>
          <p className="text-xs text-gray-500 mt-2">
            Submitted on: {vendor.appealSubmittedAt ? new Date(vendor.appealSubmittedAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>

        <div className="grid gap-4 py-4">
          {/* Action Selection */}
          <div className="grid gap-2">
            <Label>Decision</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={action === 'approve' ? 'default' : 'outline'}
                onClick={() => setAction('approve')}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Appeal (Restore Vendor)
              </Button>
              <Button
                type="button"
                variant={action === 'reject' ? 'default' : 'outline'}
                onClick={() => setAction('reject')}
                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Appeal
              </Button>
            </div>
          </div>

          {/* Response */}
          <div className="grid gap-2">
            <Label htmlFor="response">Response to Vendor</Label>
            <Textarea
              id="response"
              placeholder={action === 'approve' 
                ? "Explain why the appeal is approved and any conditions..."
                : "Explain why the appeal is rejected and what they need to do..."
              }
              value={response}
              onChange={(e) => setResponse(e.target.value)}
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
            onClick={handleSendResponse}
            disabled={loading || !response.trim()}
            className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {loading ? "Sending..." : `${action === 'approve' ? 'Approve' : 'Reject'} Appeal`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppealResponseDialog;