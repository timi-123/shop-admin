// app/(dashboard)/vendors/[vendorId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/hooks/useRole";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns as productColumns } from "@/components/products/ProductColumns";
import { columns as orderColumns } from "@/components/orders/OrderColumns";
import { columns as collectionColumns } from "@/components/collections/CollectionColumns";
import { Plus, Store, DollarSign, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const VendorDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { role, isAdmin, isVendor } = useRole();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCollections: 0,
  });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // Fetch vendor details
        const vendorRes = await fetch(`/api/vendors/${params.vendorId}`);
        if (!vendorRes.ok) {
          throw new Error("Failed to fetch vendor details");
        }
        const vendorData = await vendorRes.json();
        setVendor(vendorData);

        // Check permissions
        if (!isAdmin && (!isVendor || vendorData.clerkId !== user?.id)) {
          router.push("/");
          return;
        }

        // Fetch vendor products
        const productsRes = await fetch(`/api/vendors/${params.vendorId}/products`);
        let productsData = [];
        if (productsRes.ok) {
          productsData = await productsRes.json();
          setProducts(productsData);
        }

        // Fetch vendor collections  
        const collectionsRes = await fetch(`/api/vendors/${params.vendorId}/collections`);
        let collectionsData = [];
        if (collectionsRes.ok) {
          collectionsData = await collectionsRes.json();
          setCollections(collectionsData);
        }

        // Fetch vendor orders
        const ordersRes = await fetch(`/api/vendors/${params.vendorId}/orders`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
          
          // Calculate stats
          const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.vendorEarnings || 0), 0);
          setStats({
            totalRevenue,
            totalOrders: ordersData.length,
            totalProducts: productsData.length,
            totalCollections: collectionsData.length,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setLoading(false);
      }
    };

    if (role) {
      fetchVendorData();
    }
  }, [params.vendorId, isAdmin, isVendor, role, router, user?.id]);

  if (loading) return <Loader />;
  
  if (!vendor) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading2-bold">Vendor not found</p>
        <p className="text-grey-1 mt-5">The vendor you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="px-10 py-5">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          {vendor.logo && (
            <Image
              src={vendor.logo}
              alt="Vendor Logo"
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-heading2-bold">{vendor.businessName}</h1>
            <p className="text-grey-1">{vendor.email}</p>
          </div>
        </div>
        <Badge className={statusColors[vendor.status]}>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCollections}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="space-y-6">
            <div>
              <h2 className="text-heading3-bold mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Business Name:</p>
                  <p>{vendor.businessName}</p>
                </div>
                <div>
                  <p className="font-semibold">Email:</p>
                  <p>{vendor.email}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone:</p>
                  <p>{vendor.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <Badge className={statusColors[vendor.status]}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold">Description:</p>
                <p className="whitespace-pre-wrap">{vendor.businessDescription}</p>
              </div>
            </div>
            
            {vendor.businessAddress && (
              <div>
                <h3 className="text-heading4-bold mb-2">Business Address</h3>
                <p>{vendor.businessAddress.street}</p>
                <p>{vendor.businessAddress.city}, {vendor.businessAddress.state} {vendor.businessAddress.postalCode}</p>
                <p>{vendor.businessAddress.country}</p>
              </div>
            )}
            
            {vendor.socialMedia && (
              <div>
                <h3 className="text-heading4-bold mb-2">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {vendor.socialMedia.website && (
                    <div>
                      <p className="font-semibold">Website:</p>
                      <a href={vendor.socialMedia.website} target="_blank" rel="noopener noreferrer" className="text-blue-1">
                        {vendor.socialMedia.website}
                      </a>
                    </div>
                  )}
                  {vendor.socialMedia.facebook && (
                    <div>
                      <p className="font-semibold">Facebook:</p>
                      <p>{vendor.socialMedia.facebook}</p>
                    </div>
                  )}
                  {vendor.socialMedia.instagram && (
                    <div>
                      <p className="font-semibold">Instagram:</p>
                      <p>{vendor.socialMedia.instagram}</p>
                    </div>
                  )}
                  {vendor.socialMedia.twitter && (
                    <div>
                      <p className="font-semibold">Twitter:</p>
                      <p>{vendor.socialMedia.twitter}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {vendor.rejectionReason && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-body-medium text-red-800">
                  <span className="font-semibold">Rejection Reason:</span> {vendor.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-heading3-bold">Products</h2>
            <Link href={`/vendors/${vendor._id}/products`}>
              <Button className="bg-blue-1 text-white">
                View All Products
              </Button>
            </Link>
          </div>
          <p className="text-body-medium text-grey-1">
            Total Products: {stats.totalProducts}
          </p>
        </TabsContent>
        
        <TabsContent value="collections">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-heading3-bold">Collections</h2>
            <Link href={`/vendors/${vendor._id}/collections`}>
              <Button className="bg-blue-1 text-white">
                View All Collections
              </Button>
            </Link>
          </div>
          <p className="text-body-medium text-grey-1">
            Total Collections: {stats.totalCollections}
          </p>
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-heading3-bold">Orders</h2>
            <Link href={`/vendors/${vendor._id}/orders`}>
              <Button className="bg-blue-1 text-white">
                View All Orders
              </Button>
            </Link>
          </div>
          <p className="text-body-medium text-grey-1">
            Total Orders: {stats.totalOrders}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetailPage;