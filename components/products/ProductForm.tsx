"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
          title: initialData.title || "",
          description: initialData.description || "",
          media: initialData.media || [],
          collections: initialData.collections?.map(
            (collection) => collection._id
          ) || [],
          sizes: initialData.sizes || [],
          colors: initialData.colors || [],
          price: initialData.price || 0.1,
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

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleStockIncrease = () => {
    const currentStock = form.getValues("stockQuantity");
    form.setValue("stockQuantity", currentStock + 1);
  };

  const handleStockDecrease = () => {
    const currentStock = form.getValues("stockQuantity");
    if (currentStock > 0) {
      form.setValue("stockQuantity", currentStock - 1);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent multiple submissions and navigation conflicts
    if (submitting) {
      console.log("Form already submitting, ignoring duplicate submission");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      console.log(`Submitting product for vendor ${effectiveVendorId}`);
      console.log("Form data:", values);
      
      if (!effectiveVendorId) {
        toast.error("Vendor ID is missing");
        setError("Vendor ID is missing");
        return;
      }
      
      let url;
      let method = "POST";
      
      if (initialData) {
        url = `/api/vendors/${effectiveVendorId}/products/${initialData._id}`;
        method = "PUT";
      } else {
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
      
      const productData = await res.json();
      console.log("Product saved successfully:", productData);
      
      toast.success(`Product ${initialData ? "updated" : "created"} successfully!`);
      
      // Use window.location for more reliable navigation after form submission
      // This prevents conflicts with React Router state
      const redirectUrl = isAdmin 
        ? `/vendors/${effectiveVendorId}/products` 
        : "/my-products";
      
      console.log("Redirecting to:", redirectUrl);
      
      // Small delay to ensure toast is visible, then navigate
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
      
    } catch (err: any) {
      console.error("Error submitting product:", err);
      setError(err.message || "Something went wrong! Please try again.");
      toast.error(err.message || "Something went wrong! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Improved cancel handler that prevents navigation conflicts
  const handleCancel = () => {
    if (submitting) {
      console.log("Cannot cancel while submitting");
      return;
    }
    
    const cancelUrl = isAdmin 
      ? `/vendors/${effectiveVendorId}/products` 
      : "/my-products";
    
    console.log("Cancelling and navigating to:", cancelUrl);
    window.location.href = cancelUrl;
  };

  useEffect(() => {
    const getCollections = async () => {
      try {
        if (!effectiveVendorId) {
          console.log("No vendor ID available, skipping collections fetch");
          setLoading(false);
          return;
        }
        
        console.log("Fetching collections for vendor:", effectiveVendorId);
        
        const res = await fetch(`/api/vendors/${effectiveVendorId}/collections`);
        if (res.ok) {
          const collectionsData = await res.json();
          setCollections(collectionsData);
          console.log("Collections loaded:", collectionsData.length);
        } else {
          console.error("Failed to fetch collections:", res.status);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    getCollections();
  }, [effectiveVendorId]);

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
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }} 
          className="space-y-8"
        >
          
          {/* Title Field */}
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
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          {/* Description Field */}
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
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          {/* Media Upload */}
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
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          {/* Price and Stock Row */}
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
                      onKeyDown={handleKeyPress}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />

            {/* Enhanced Stock Quantity Field */}
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Stock Quantity
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center border border-input rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={handleStockDecrease}
                        disabled={field.value <= 0 || submitting}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        className="border-0 border-x text-center focus-visible:ring-0 rounded-none"
                        {...field}
                        onKeyDown={handleKeyPress}
                        disabled={submitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={handleStockIncrease}
                        disabled={submitting}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {field.value === 0 && (
                      <span className="text-red-500">⚠️ Out of stock</span>
                    )}
                    {field.value > 0 && field.value <= 10 && (
                      <span className="text-yellow-600">⚠️ Low stock</span>
                    )}
                    {field.value > 10 && (
                      <span className="text-green-600">✅ In stock</span>
                    )}
                  </div>
                  <FormMessage className="text-red-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Collections Field */}
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
                    onChange={(collectionId) =>
                      field.onChange([...field.value, collectionId])
                    }
                    onRemove={(collectionIdToRemove) =>
                      field.onChange([
                        ...field.value.filter(
                          (collectionId) => collectionId !== collectionIdToRemove
                        ),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          {/* Colors Field */}
          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors</FormLabel>
                <FormControl>
                  <MultiText
                    placeholder="Add colors"
                    value={field.value}
                    onChange={(color) => field.onChange([...field.value, color])}
                    onRemove={(colorToRemove) =>
                      field.onChange([
                        ...field.value.filter((color) => color !== colorToRemove),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          {/* Sizes Field */}
          <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sizes</FormLabel>
                <FormControl>
                  <MultiText
                    placeholder="Add sizes"
                    value={field.value}
                    onChange={(size) => field.onChange([...field.value, size])}
                    onRemove={(sizeToRemove) =>
                      field.onChange([
                        ...field.value.filter((size) => size !== sizeToRemove),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-1" />
              </FormItem>
            )}
          />

          <div className="flex gap-10">
            <Button
              type="submit"
              className="bg-blue-1 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-grey-1 text-black"
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