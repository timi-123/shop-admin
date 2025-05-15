// components/collections/CollectionForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";

import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import ImageUpload from "../custom ui/ImageUpload";
import { useState } from "react";
import toast from "react-hot-toast";
import Delete from "../custom ui/Delete";

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500).trim(),
  image: z.string().min(1, "Image is required"),
});

interface CollectionFormProps {
  initialData?: CollectionType | null;
  vendorId?: string;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ initialData, vendorId }) => {
  const router = useRouter();
  const params = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Use vendorId from props, or try to get it from params
  const effectiveVendorId = vendorId || (params?.vendorId as string);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          image: initialData.image,
        }
      : {
          title: "",
          description: "",
          image: "",
        },
  });

  // This function prevents the default form submission behavior
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Prevent multiple submissions
      if (submitting) return;
      
      setSubmitting(true);
      
      console.log(`Creating collection for vendor ${effectiveVendorId}`);
      console.log("Form data:", values);
      
      if (!effectiveVendorId) {
        toast.error("Vendor ID is missing");
        setSubmitting(false);
        return;
      }
      
      let url;
      let method = "POST";
      
      if (initialData) {
        // Update existing collection
        url = `/api/vendors/${effectiveVendorId}/collections/${initialData._id}`;
      } else {
        // Create new collection
        url = `/api/vendors/${effectiveVendorId}/collections`;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit collection");
      }
      
      // Set success state
      setSubmitSuccess(true);
      toast.success(`Collection ${initialData ? "updated" : "created"} successfully!`);
      
      // Wait a moment before redirecting to ensure toast is shown
      setTimeout(() => {
        router.push(`/vendors/${effectiveVendorId}/collections`);
      }, 800);
      
    } catch (err: any) {
      console.error("Error submitting collection:", err);
      toast.error(err.message || "Something went wrong! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel button click separately from form submission
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    
    // Navigate back to collections
    if (effectiveVendorId) {
      router.push(`/vendors/${effectiveVendorId}/collections`);
    } else {
      router.push("/collections");
    }
  };

  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Collection</p>
          <Delete id={initialData._id} item="collection" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Collection</p>
      )}
      <Separator className="bg-grey-1 mt-4 mb-7" />
      
      {/* Use React Hook Form but manually handle submission */}
      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} onKeyDown={handleKeyPress} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} rows={5} onKeyDown={handleKeyPress} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-10">
            <Button 
              type="submit" 
              className="bg-blue-1 text-white"
              disabled={submitting || submitSuccess}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
            <Button
              type="button" // Important: This must be type="button"
              onClick={handleCancel}
              className="bg-blue-1 text-white"
              disabled={submitting || submitSuccess}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CollectionForm;