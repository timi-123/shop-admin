// components/debug/FixPlatformFees.tsx
"use client";

import { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle, Percent } from "lucide-react";

interface FeeUpdateDetail {
  orderId: string;
  originalFee: string;
  newFee: string;
  difference: string;
}

interface UpdateResults {
  totalOrders: number;
  ordersUpdated: number;
  details: FeeUpdateDetail[];
}

export default function FixPlatformFees() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UpdateResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFixPlatformFees() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/fix-platform-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update platform fees');
      }
      
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error('Error updating platform fees:', err);
      setError(err?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-blue-500" />
          Update Platform Fees to 7%
        </CardTitle>
        <CardDescription>
          Fix all orders to use the new 7% platform fee (was previously 10-11%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            This tool updates all existing orders to use the new 7% platform fee. 
            It recalculates vendor commissions and earnings based on this rate.
          </p>
          
          <Button 
            onClick={handleFixPlatformFees}
            disabled={loading}
            variant={loading ? "outline" : "default"}
          >
            {loading ? "Updating Fees..." : "Update All Platform Fees"}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="text-red-500 h-5 w-5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {results && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-500 h-5 w-5" />
                <p className="text-green-800 font-medium">Platform Fees Updated</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Orders Checked</p>
                  <p className="text-xl font-semibold">{results.totalOrders}</p>
                </div>
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Orders Updated</p>
                  <p className="text-xl font-semibold">{results.ordersUpdated}</p>
                </div>
              </div>
              
              {results.details && results.details.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Updated orders:</p>
                  <div className="max-h-60 overflow-y-auto rounded border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Order ID</th>
                          <th className="p-2 text-right">Original Fee</th>
                          <th className="p-2 text-right">New Fee</th>
                          <th className="p-2 text-right">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.details.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{item.orderId}</td>
                            <td className="p-2 text-right">${item.originalFee}</td>
                            <td className="p-2 text-right">${item.newFee}</td>
                            <td className={`p-2 text-right ${
                              parseFloat(item.difference) < 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {parseFloat(item.difference) < 0 ? '-' : '+'}${Math.abs(parseFloat(item.difference)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
