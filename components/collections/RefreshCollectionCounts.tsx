// components/collections/RefreshCollectionCounts.tsx
"use client";

import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshCollectionCounts() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function handleRefresh() {
    setLoading(true);
    try {
      // Call the API endpoint to fix all collection counts
      await fetch('/api/debug/fix-all-collection-counts');
      
      // Refresh the page to show updated counts
      router.refresh();
    } catch (error) {
      console.error('Error refreshing collection counts:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Button 
      onClick={handleRefresh} 
      variant="outline" 
      size="sm" 
      disabled={loading}
      className="ml-2"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing..." : "Refresh Counts"}
    </Button>
  );
}
