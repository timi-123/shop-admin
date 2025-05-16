// components/debug/DebugCollectionForm.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "../custom ui/ImageUpload";
import toast from "react-hot-toast";

const DebugCollectionForm = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { isAdmin, isVendor } = useRole();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  const vendorId = params.vendorId as string;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiResponse(null);
    
    try {
      console.log("Submitting collection with data:", formData);
      console.log("Vendor ID:", vendorId);
      
      if (!vendorId) {
        throw new Error("Vendor ID is missing");
      }
      
      if (!formData.title || !formData.image) {
        throw new Error("Title and image are required");
      }
      
      // Make the API request
      const response = await fetch(`/api/vendors/${vendorId}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      // Get the full response data
      const responseData = await response.json();
      setApiResponse(responseData);
      
      console.log("API Response:", response.status, responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create collection");
      }
      
      toast.success("Collection created successfully!");
      
      // Only redirect if the collection was created successfully
      if (isAdmin) {
        router.push(`/vendors/${vendorId}/collections`);
      } else {
        router.push("/my-collections");
      }
      
    } catch (err: any) {
      console.error("Error creating collection:", err);
      setError(err.message || "An error occurred while creating the collection");
      toast.error(err.message || "Failed to create collection");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-10">
      <h1 className="text-heading2-bold mb-6">Debug Collection Form</h1>
      <p className="mb-4">Vendor ID: {vendorId || "Not provided"}</p>
      <p className="mb-4">User Role: {isAdmin ? "Admin" : isVendor ? "Vendor" : "User"}</p>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-6 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {apiResponse && (
        <div className="bg-gray-50 p-4 mb-6 rounded-md">
          <p className="font-bold">API Response:</p>
          <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-40">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Title</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Collection Title"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold">Description</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Collection Description"
            rows={4}
          />
        </div>
        
        <div>
          <label className="block mb-2 font-semibold">Image</label>
          <ImageUpload
            value={formData.image ? [formData.image] : []}
            onChange={handleImageChange}
            onRemove={() => setFormData(prev => ({ ...prev, image: "" }))}
          />
        </div>
        
        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-blue-1 text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Collection"}
          </Button>
          
          <Button
            type="button"
            className="bg-gray-200 text-gray-800"
            onClick={() => {
              if (isAdmin) {
                router.push(`/vendors/${vendorId}/collections`);
              } else {
                router.push("/my-collections");
              }
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DebugCollectionForm;