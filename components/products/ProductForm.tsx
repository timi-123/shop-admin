// components/products/ProductForm.tsx - CRITICAL FIXES for Authentication Issues
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/hooks/useRole";
import toast from "react-hot-toast";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ImageUpload from "../custom ui/ImageUpload";
import MultiSelect from "../custom ui/MultiSelect";
import MultiText from "../custom ui/MultiText";
import Delete from "../custom ui/Delete";
import Loader from "../custom ui/Loader";
import { Package, Plus, Minus } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(500).trim(),
  media: z.array(z.string()),
  collections: z.array(z.string()),
  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  price: z.coerce.number().min(0.1),
  stockQuantity: z.coerce.number().min(0).int(),
});

interface ProductFormProps {
  initialData?: ProductType | null;
  vendorId?: string;
  isAdmin?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  vendorId,
  isAdmin = false,
}) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { role, isVendor } = useRole();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine effective vendor ID
  const effectiveVendorId = vendorId || (typeof initialData?.vendor === 'string' ? initialData.vendor : initialData?.vendor?._id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          media: initialData.media,
          collections: initialData.collections.map((collection) => 
            typeof collection === 'string' ? collection : collection._id
          ),
          sizes: initialData.sizes,
          colors: initialData.colors,
          price: initialData.price,
          stockQuantity: initialData.stockQuantity || 0,
        }
      : {
          title: "",
          description: "",
          media: [],
          collections: [],
          sizes: [],
          colors: [],
          price: 0.1,
          stockQuantity: 0,
        },
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    
    if (submitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare the request body
      const requestBody = {
        ...values,
        vendor: effectiveVendorId,
      };

      console.log("Submitting product with body:", requestBody);

      const url = initialData ? `/api/products/${initialData._id}` : "/api/products";
      const method = initialData ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Product saved successfully:", result);
        
        toast.success(`Product ${initialData ? "updated" : "created"} successfully!`);
        
        // Navigate after successful submission
        const redirectUrl = isAdmin 
          ? `/vendors/${effectiveVendorId}/products` 
          : "/my-products";
        
        console.log("Redirecting to:", redirectUrl);
        
        // Use router.push instead of window.location for better handling
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
        
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to save product");
      }
      
    } catch (err: any) {
      console.error("Error submitting product:", err);
      setError(err.message || "Something went wrong! Please try again.");
      toast.error(err.message || "Something went wrong! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      console.log("Cannot cancel while submitting");
      return;
    }
    
    const cancelUrl = isAdmin 
      ? `/vendors/${effectiveVendorId}/products` 
      : "/my-products";
    
    console.log("Cancelling and navigating to:", cancelUrl);
    router.push(cancelUrl);
  };

  useEffect(() => {
    const getCollections = async () => {
      // CRITICAL FIX: Wait for authentication before making API calls
      if (!isLoaded || !user) {
        console.log("User not loaded yet, waiting...");
        return;
      }

      try {
        if (!effectiveVendorId) {
          console.log("No vendor ID available, skipping collections fetch");
          setLoading(false);
          return;
        }
        
        console.log("Fetching collections for vendor:", effectiveVendorId);
        
        // CRITICAL FIX: Add proper error handling for collections fetch
        const res = await fetch(`/api/vendors/${effectiveVendorId}/collections`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const collectionsData = await res.json();
          setCollections(collectionsData);
          console.log("Collections loaded:", collectionsData.length);
        } else {
          console.error("Failed to fetch collections:", res.status, res.statusText);
          // Don't set error for collections failure, just continue without collections
          if (res.status === 401) {
            console.log("Unauthorized - user may not be authenticated yet");
          }
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        // Don't set error for collections failure, just continue without collections
      } finally {
        setLoading(false);
      }
    };

    // CRITICAL FIX: Only fetch collections when user is loaded
    if (isLoaded && user) {
      getCollections();
    } else if (isLoaded && !user) {
      // User is loaded but not authenticated
      setLoading(false);
    }
  }, [effectiveVendorId, isLoaded, user]);

  if (loading) return <Loader />;

  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete item="product" id={initialData._id} />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
      )}
      
      <Separator className="bg-grey-1 mt-4 mb-7" />
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyPress}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
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
                  <Textarea placeholder="Description" {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Price" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Stock Quantity" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {collections.length > 0 && (
            <FormField
              control={form.control}
              name="collections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collections</FormLabel>
                  <FormControl>
                    <MultiSelect
                      placeholder="Collections"
                      collections={collections}
                      value={field.value}
                      onChange={(_id) =>
                        field.value.includes(_id)
                          ? field.onChange([
                              ...field.value.filter((value) => value !== _id),
                            ])
                          : field.onChange([...field.value, _id])
                      }
                      onRemove={(_id) =>
                        field.onChange([
                          ...field.value.filter((value) => value !== _id),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sizes</FormLabel>
                <FormControl>
                  <MultiText
                    placeholder="Sizes"
                    value={field.value}
                    onChange={(size) => field.onChange([...field.value, size])}
                    onRemove={(sizeToRemove) =>
                      field.onChange([
                        ...field.value.filter((size) => size !== sizeToRemove),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors</FormLabel>
                <FormControl>
                  <MultiText
                    placeholder="Colors"
                    value={field.value}
                    onChange={(color) => field.onChange([...field.value, color])}
                    onRemove={(colorToRemove) =>
                      field.onChange([
                        ...field.value.filter((color) => color !== colorToRemove),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-10">
            <Button type="submit" className="bg-blue-1 text-white" disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </Button>
            <Button 
              type="button" 
              onClick={handleCancel} 
              className="bg-grey-1 text-white"
              disabled={submitting}
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