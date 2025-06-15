// components/debug/RepairCollections.tsx
"use client";

import { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function RepairCollections() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  async function handleRepairCollections() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/debug/repair-collections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to repair collections');
      }
      
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error('Error repairing collections:', err);
      setError(err?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repair Collection Product Counts</CardTitle>
        <CardDescription>
          Fix inconsistencies between products and their collections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            This tool will scan all collections and products to ensure product counts are accurate.
            It fixes two issues:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Products that reference collections but aren't listed in the collection</li>
            <li>Products listed in collections that don't reference those collections</li>
          </ul>
          
          <Button 
            onClick={handleRepairCollections}
            disabled={loading}
            variant={loading ? "outline" : "default"}
          >
            {loading ? "Repairing..." : "Repair Collections"}
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
                <p className="text-green-800 font-medium">Repair Complete</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Collections Processed</p>
                  <p className="text-xl font-semibold">{results.collectionsProcessed}</p>
                </div>
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Collections Fixed</p>
                  <p className="text-xl font-semibold">{results.collectionsWithChanges}</p>
                </div>
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Products Added</p>
                  <p className="text-xl font-semibold">{results.productsAdded}</p>
                </div>
                <div className="p-2 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Products Removed</p>
                  <p className="text-xl font-semibold">{results.productsRemoved}</p>
                </div>
              </div>
              
              {results.details && results.details.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Collections with changes:</p>
                  <div className="max-h-60 overflow-y-auto rounded border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Collection</th>
                          <th className="p-2 text-right">Added</th>
                          <th className="p-2 text-right">Removed</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>                        {results.details.map((item: {
                          collectionId: string;
                          collectionName: string;
                          productsAdded: number;
                          productsRemoved: number;
                          productsAfterRepair: number;
                        }, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{item.collectionName}</td>
                            <td className="p-2 text-right text-green-600">+{item.productsAdded}</td>
                            <td className="p-2 text-right text-red-600">-{item.productsRemoved}</td>
                            <td className="p-2 text-right font-medium">{item.productsAfterRepair}</td>
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
