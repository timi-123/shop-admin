// components/products/ProductForm.tsx - Updated without Cost and Tags
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Delete from "../custom ui/Delete";
import MultiText from "../custom ui/MultiText";
import MultiSelect from "../custom ui/MultiSelect";
import Loader from "../custom ui/Loader";
import { useRole } from "@/lib/hooks/useRole";

const formSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500).trim(),
  media: z.array(z.string()).min(1, "At least one image is required"),
  collections: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  price: z.coerce.number().min(0.1),
});

interface ProductFormProps {
  initialData?: ProductType | null;
  vendorId?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, vendorId }) => {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, isVendor } = useRole();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Determine the vendor ID from props or params
  const effectiveVendorId = vendorId || (params?.vendorId as string);

  const getCollections = async () => {
    try {
      setLoading(true);
      console.log("Fetching collections for vendor:", effectiveVendorId);
      
      let url;
      if (effectiveVendorId) {
        // Get vendor-specific collections
        url = `/api/vendors/${effectiveVendorId}/collections`;
      } else {
        // Get all collections for admin
        url = "/api/collections";
      }
      
      const res = await fetch(url, {
        method: "GET"
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch collections");
      }
      
      const data = await res.json();
      setCollections(data);
    } catch (err: any) {
      console.error("Error fetching collections:", err);
      toast.error(err.message || "Failed to fetch collections");
      setError(err.message || "Failed to fetch collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveVendorId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
            defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          media: initialData.media,
          collections: initialData.collections.map(
            (collection) => collection._id
          ),
          sizes: initialData.sizes,
          colors: initialData.colors,
          price: initialData.price,
        }
      : {
          title: "",
          description: "",
          media: [],
          collections: [],
          sizes: [],
          colors: [],
          price: 0.1,
        },
  });

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Prevent multiple submissions
      if (submitting) return;
      
      setSubmitting(true);
      setError(null);
      
      console.log(`Submitting product for vendor ${effectiveVendorId}`);
      console.log("Form data:", values);
      
      if (!effectiveVendorId) {
        toast.error("Vendor ID is missing");
        setError("Vendor ID is missing");
        setSubmitting(false);
        return;
      }
      
      let url;
      let method = "POST";
      
      if (initialData) {
        // Update existing product
        url = `/api/vendors/${effectiveVendorId}/products/${initialData._id}`;
      } else {
        // Create new product
        url = `/api/vendors/${effectiveVendorId}/products`;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit product");
      }
      
      // Set success state
      setSubmitSuccess(true);
      toast.success(`Product ${initialData ? "updated" : "created"} successfully!`);
      
      // Wait a moment before redirecting to ensure toast is shown
      setTimeout(() => {
        if (isAdmin) {
          router.push(`/vendors/${effectiveVendorId}/products`);
        } else {
          router.push("/my-products");
        }
      }, 800);
      
    } catch (err: any) {
      console.error("Error submitting product:", err);
      setError(err.message || "Something went wrong! Please try again.");
      toast.error(err.message || "Something went wrong! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel button click separately from form submission
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    
    // Navigate back
    if (isAdmin) {
      router.push(`/vendors/${effectiveVendorId}/products`);
    } else {
      router.push("/my-products");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete id={initialData._id} item="product" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
      )}
      <Separator className="bg-grey-1 mt-4 mb-7" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
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
                  <Input
                    placeholder="Product title"
                    {...field}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
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
                  <Textarea
                    placeholder="Product description"
                    {...field}
                    rows={5}
                    onKeyDown={handleKeyPress}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange([...field.value, url])}
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((image) => image !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <div className="md:grid md:grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onKeyDown={handleKeyPress}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="md:grid md:grid-cols-3 gap-8">
            {collections.length > 0 && (
              <FormField
                control={form.control}
                name="collections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select collections"
                        collections={collections}
                        value={field.value}
                        onChange={(_id) =>
                          field.onChange([...field.value, _id])
                        }
                        onRemove={(idToRemove) =>
                          field.onChange([
                            ...field.value.filter(
                              (collectionId) => collectionId !== idToRemove
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-1" />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Add colors (e.g., Red, Blue, Green)"
                      value={field.value}
                      onChange={(color) =>
                        field.onChange([...field.value, color])
                      }
                      onRemove={(colorToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (color) => color !== colorToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes</FormLabel>
                  <FormControl>
                    <MultiText
                      placeholder="Add sizes (e.g., S, M, L, XL)"
                      value={field.value}
                      onChange={(size) =>
                        field.onChange([...field.value, size])
                      }
                      onRemove={(sizeToRemove) =>
                        field.onChange([
                          ...field.value.filter(
                            (size) => size !== sizeToRemove
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

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

export default ProductForm;