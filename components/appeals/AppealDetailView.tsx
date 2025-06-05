// components/appeals/AppealDetailView.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  FileText
} from "lucide-react";
import AppealResponseDialog from "../vendors/AppealResponseDialog";

interface AppealDetailViewProps {
  vendor: VendorType;
  onResponseSent?: () => void;
}

const AppealDetailView: React.FC<AppealDetailViewProps> = ({ 
  vendor, 
  onResponseSent 
}) => {
  const getStatusIcon = () => {
    if (!vendor.appealSubmitted) {
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
    
    if (vendor.appealResponse) {
      return vendor.status === "approved" 
        ? <CheckCircle className="h-5 w-5 text-green-600" />
        : <XCircle className="h-5 w-5 text-red-600" />;
    }
    
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusBadge = () => {
    if (!vendor.appealSubmitted) {
      return <Badge className="bg-gray-100 text-gray-800">No Appeal</Badge>;
    }
    
    if (vendor.appealResponse) {
      return vendor.status === "approved" ? (
        <Badge className="bg-green-100 text-green-800">Appeal Approved</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">Appeal Rejected</Badge>
      );
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <CardTitle>Appeal Details - {vendor.businessName}</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* Vendor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Vendor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">Business Name:</p>
              <p>{vendor.businessName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Email:</p>
              <p>{vendor.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Suspended Date:</p>
              <p>{vendor.suspendedAt ? new Date(vendor.suspendedAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Current Status:</p>
              <p className="capitalize">{vendor.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspension Details */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Suspension Reason
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800">
              {vendor.suspendedReason || 'No reason provided'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Information */}
      {vendor.appealSubmitted && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Appeal Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Submitted on: {vendor.appealSubmittedAt ? new Date(vendor.appealSubmittedAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-800 mb-2">Vendor's Appeal:</p>
              <p className="text-blue-700">
                {vendor.appealReason || 'No appeal reason provided'}
              </p>
            </div>

            {/* Action Buttons */}
            {!vendor.appealResponse && onResponseSent && (
              <div className="flex justify-center pt-4">
                <AppealResponseDialog vendor={vendor} onResponseSent={onResponseSent} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Response */}
      {vendor.appealResponse && (
        <Card className={vendor.status === "approved" ? "border-green-200" : "border-red-200"}>
          <CardHeader className={vendor.status === "approved" ? "bg-green-50" : "bg-red-50"}>
            <CardTitle className={`flex items-center gap-2 ${
              vendor.status === "approved" ? "text-green-800" : "text-red-800"
            }`}>
              <FileText className="h-5 w-5" />
              Admin Response
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Responded on: {vendor.appealResponseAt ? new Date(vendor.appealResponseAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className={`p-4 rounded-lg ${
              vendor.status === "approved" ? "bg-green-50" : "bg-red-50"
            }`}>
              <p className={`font-semibold mb-2 ${
                vendor.status === "approved" ? "text-green-800" : "text-red-800"
              }`}>
                Decision: {vendor.status === "approved" ? "Appeal Approved" : "Appeal Rejected"}
              </p>
              <p className={vendor.status === "approved" ? "text-green-700" : "text-red-700"}>
                {vendor.appealResponse}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Appeal */}
      {!vendor.appealSubmitted && (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 mb-2">No Appeal Submitted</p>
            <p className="text-gray-500 text-center">
              This vendor has not submitted a suspension appeal yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppealDetailView;