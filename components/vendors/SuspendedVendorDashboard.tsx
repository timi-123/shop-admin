// components/vendors/SuspendedVendorDashboard.tsx - Fixed JSX Console Logs
"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, MessageSquare, CheckCircle, XCircle, LogOut } from "lucide-react";
import AppealDialog from "./AppealDialog";
import Loader from "@/components/custom ui/Loader";

const SuspendedVendorDashboard = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await fetch("/api/vendors/my-vendor");
        if (response.ok) {
          const vendorData = await response.json();
          setVendor(vendorData);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVendorData();
    }
  }, [user]);

  const handleAppealSubmitted = () => {
    console.log("=== HANDLE APPEAL SUBMITTED CALLED ===");
    console.log("Current vendor before update:", vendor);
    
    if (vendor) {
      setVendor({
        ...vendor,
        appealSubmitted: true,
        appealSubmittedAt: new Date(),
      });
      
      console.log("Vendor state updated in parent component");
    }
    

  };

  if (loading) return <Loader />;

  if (!vendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Vendor information not found</p>
      </div>
    );
  }

  
  // Check what should render
  

  return (
    <div className="px-10 py-5 max-w-4xl mx-auto">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex items-center justify-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-heading2-bold text-red-600">Account Suspended</h1>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        <p className="text-grey-1">
          Your vendor account has been suspended. All vendor functionalities are temporarily disabled.
        </p>
      </div>

      {/* Suspension Details */}
      <Card className="mb-6 border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Suspension Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-700">Business Name:</p>
              <p>{vendor.businessName}</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-700">Suspension Date:</p>
              <p>{vendor.suspendedAt ? new Date(vendor.suspendedAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-700">Reason for Suspension:</p>
              <div className="bg-red-50 p-3 rounded-lg mt-2">
                <p className="text-red-800">{vendor.suspendedReason || 'No reason provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeal Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Appeal Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor.appealSubmitted ? (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  If you believe this suspension is unfair or based on a misunderstanding, 
                  you can submit an appeal. Please provide a detailed explanation of your case.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <AppealDialog vendor={vendor} onAppealSubmitted={handleAppealSubmitted} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="h-5 w-5" />
                <Badge className="bg-blue-100 text-blue-800">Appeal Submitted</Badge>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800 mb-2">Your Appeal:</p>
                <p className="text-blue-700 mb-2">{vendor.appealReason}</p>
                <p className="text-xs text-blue-600">
                  Submitted on: {vendor.appealSubmittedAt ? new Date(vendor.appealSubmittedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              {vendor.appealResponse ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {vendor.status === "approved" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">Appeal Approved</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <Badge className="bg-red-100 text-red-800">Appeal Rejected</Badge>
                      </>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    vendor.status === "approved" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <p className={`font-semibold mb-2 ${
                      vendor.status === "approved" ? "text-green-800" : "text-red-800"
                    }`}>
                      Admin Response:
                    </p>
                    <p className={vendor.status === "approved" ? "text-green-700" : "text-red-700"}>
                      {vendor.appealResponse}
                    </p>
                    <p className={`text-xs mt-2 ${
                      vendor.status === "approved" ? "text-green-600" : "text-red-600"
                    }`}>
                      Response date: {vendor.appealResponseAt ? new Date(vendor.appealResponseAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>

                  {vendor.status === "approved" && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Great news! Your appeal has been approved and your vendor account has been restored. 
                        You can now access all vendor functionalities again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your appeal is being reviewed by our admin team. 
                    You will receive a response within 3-5 business days.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <p>Submit an appeal with a detailed explanation if you haven't already</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <p>Our admin team will review your appeal within 3-5 business days</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <p>You will receive a response with the decision and any further instructions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <p>If approved, all your vendor functionalities will be restored immediately</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-grey-1 space-y-2">
        <p>If you have any questions, please contact our support team.</p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out & Use Different Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuspendedVendorDashboard;