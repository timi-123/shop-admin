// app/(dashboard)/vendors/[vendorId]/collections/basic/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ImageUpload from "@/components/custom ui/ImageUpload";
import { Separator } from "@/components/ui/separator";

export default function BasicCollectionForm() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.MouseEvent) => {
    // Important: This is NOT a form submit handler
    // This is a click handler so we don't need preventDefault()
    
    // Clear previous errors and responses
    setError(null);
    setResponseMessage(null);
    
    // Validate form
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    
    if (!image) {
      setError("Image is required");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Creating collection for vendor ${vendorId}`);
      console.log("Form data:", { title, description, image });
      
      const response = await fetch(`/api/vendors/${vendorId}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          image,
        }),
      });
      
      const data = await response.json();
      console.log("API response:", response.status, data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection");
      }
      
      setResponseMessage("Collection created successfully! Collection ID: " + data._id);
      
      // Reset form
      setTitle("");
      setDescription("");
      setImage("");
      
    } catch (err: any) {
      console.error("Error creating collection:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Basic Collection Form</h1>
      <p className="text-gray-600 mb-6">
        For vendor ID: {vendorId}
      </p>
      
      <Separator className="my-6" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
      {responseMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 mb-6 rounded-md">
          {responseMessage}
        </div>
      )}
      
      {/* Note: This is NOT a form element, it's a div */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Collection Title"
            disabled={loading}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Collection Description"
            rows={5}
            disabled={loading}
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Image</label>
          <ImageUpload
            value={image ? [image] : []}
            onChange={(url) => setImage(url)}
            onRemove={() => setImage("")}
          />
        </div>
        
        <div className="flex gap-4 pt-4">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Collection"}
          </button>
          
          <a 
            href={`/vendors/${vendorId}/collections`}
            className="px-4 py-2 border border-gray-300 rounded-md text-center"
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}