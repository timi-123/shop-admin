// components/debug/FixCollectionCounts.tsx
"use client";

import { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function FixCollectionCounts() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  async function handleFixCollectionCounts() {
    setLoading(true);
    setError(null);
    
    try {
      // First try our new endpoint that maintains bidirectional connection
      const res = await fetch('/api/admin/fix-collection-counts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        // Fallback to the old endpoint if the new one fails
        const fallbackRes = await fetch('/api/debug/fix-all-collection-counts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!fallbackRes.ok) {
          const errorData = await fallbackRes.json();
          throw new Error(errorData.error || 'Failed to fix collection counts');
        }
        
        const data = await fallbackRes.json();
        setResults(data);
      } else {
        const data = await res.json();
        
        // Format the results to match the expected format
        if (data.success) {
          setResults({
            collectionsUpdated: data.totalCollections,
            collectionsWithMismatch: data.fixedCollections,
            mismatchDetails: data.results.map((item: any) => ({
              collectionName: item.title,
              storedCount: item.finalProductCount - item.productsAdded + item.productsRemoved,
              actualCount: item.finalProductCount,
              difference: item.productsAdded - item.productsRemoved
            }))
          });
        } else {
          throw new Error(data.error || 'Failed to fix collection counts');
        }
      }
    } catch (err: any) {
      console.error('Error fixing collection counts:', err);
      setError(err?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          Fix Collection Product Counts
        </CardTitle>
        <CardDescription>
          Update collection product counts to match the actual number of products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            This tool updates all collections to ensure the product counts displayed in the UI 
            match the actual number of products in each collection.
          </p>
          
          <Button 
            onClick={handleFixCollectionCounts}
            disabled={loading}
            variant={loading ? "outline" : "default"}
          >
            {loading ? "Updating Counts..." : "Fix Collection Counts"}
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
                <p className="text-green-800 font-medium">Collection Counts Fixed</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Collections Checked</p>
                  <p className="text-xl font-semibold">{results.collectionsUpdated}</p>
                </div>
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Collections Fixed</p>
                  <p className="text-xl font-semibold">{results.collectionsWithMismatch}</p>
                </div>
              </div>
              
              {results.mismatchDetails && results.mismatchDetails.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Collections with mismatches:</p>
                  <div className="max-h-60 overflow-y-auto rounded border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Collection</th>
                          <th className="p-2 text-right">Stored Count</th>
                          <th className="p-2 text-right">Actual Count</th>
                          <th className="p-2 text-right">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.mismatchDetails.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{item.collectionName}</td>
                            <td className="p-2 text-right">{item.storedCount}</td>
                            <td className="p-2 text-right">{item.actualCount}</td>
                            <td className={`p-2 text-right ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.difference > 0 ? `+${item.difference}` : item.difference}
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
