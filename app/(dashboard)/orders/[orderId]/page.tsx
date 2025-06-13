// app/(dashboard)/orders/[orderId]/page.tsx - UPDATED VERSION WITH STATUS DROPDOWN
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface OrderDetails {
  _id: string;
  customerClerkId: string;
  products: any[];
  vendorOrders: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  platformFee: number;
}

const OrderDetailsPage = () => {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingVendorStatus, setUpdatingVendorStatus] = useState<string | null>(null);

  const STATUS_OPTIONS = [
    { value: "order_received", label: "Order Received", description: "Vendor has seen your order" },
    { value: "in_production", label: "In Production", description: "In production" },
    { value: "ready_to_ship", label: "Ready to Ship", description: "Ready for delivery" },
    { value: "shipped", label: "Shipped", description: "Sent for delivery" },
    { value: "delivered", label: "Delivered", description: "Delivered" },
    { value: "cancelled", label: "Cancelled", description: "Cancelled" }
  ];

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      "order_received": "bg-blue-100 text-blue-800",
      "in_production": "bg-yellow-100 text-yellow-800", 
      "ready_to_ship": "bg-purple-100 text-purple-800",
      "shipped": "bg-orange-100 text-orange-800",
      "delivered": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800",
      "pending": "bg-yellow-100 text-yellow-800",
      "processing": "bg-blue-100 text-blue-800",
      "paid": "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Error loading order details");
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate overall order status based on vendor statuses
  const calculateOverallOrderStatus = (vendorOrders: any[]): string => {
    if (!vendorOrders || vendorOrders.length === 0) return "pending";
    
    const statuses = vendorOrders.map((vo: any) => vo.status);
    
    // If all vendors have delivered, overall is delivered
    if (statuses.every((status: string) => status === "delivered")) {
      return "delivered";
    }
    
    // If any vendor has shipped, overall is shipped
    if (statuses.some((status: string) => status === "shipped")) {
      return "shipped";
    }
    
    // If any vendor is in production or ready to ship, overall is processing
    if (statuses.some((status: string) => ["in_production", "ready_to_ship"].includes(status))) {
      return "processing";
    }
    
    // If all vendors cancelled, overall is cancelled
    if (statuses.every((status: string) => status === "cancelled")) {
      return "cancelled";
    }
    
    // Default to pending (for order_received status)
    return "pending";
  };

  const updateVendorOrderStatus = async (vendorId: string, newStatus: string) => {
    setUpdatingVendorStatus(vendorId);
    try {
      const response = await fetch(`/api/vendors/${vendorId}/orders/${params.orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Vendor order status updated successfully");
        
        // Update the local state
        if (order) {
          const updatedOrder = { ...order };
          const vendorOrderIndex = updatedOrder.vendorOrders.findIndex(
            (vo: any) => vo.vendor._id === vendorId
          );
          
          if (vendorOrderIndex !== -1) {
            updatedOrder.vendorOrders[vendorOrderIndex].status = newStatus;
            updatedOrder.vendorOrders[vendorOrderIndex].customerStatusMessage = 
              result.vendorOrder?.customerStatusMessage || 
              STATUS_OPTIONS.find(s => s.value === newStatus)?.description || 
              newStatus;
          }
          
          // Calculate and update the overall order status
          updatedOrder.status = calculateOverallOrderStatus(updatedOrder.vendorOrders);
          
          setOrder(updatedOrder);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update vendor order status");
      }
    } catch (error) {
      console.error("Error updating vendor order status:", error);
      toast.error("Error updating vendor order status");
    } finally {
      setUpdatingVendorStatus(null);
    }
  };

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetails();
    }
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-12">
          <p className="text-heading3-bold text-red-1">Order Not Found</p>
          <p className="text-body-medium mt-4">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="mb-8">
        <h1 className="text-heading2-bold">Order Details</h1>
        <p className="text-body-medium text-grey-2">Order ID: {order._id}</p>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Order Information */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-heading4-bold mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-small-medium text-grey-2">Order Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Payment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Order Date</p>
                <p className="text-body-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Customer ID</p>
                <p className="text-body-medium font-mono text-sm">{order.customerClerkId}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-heading4-bold mb-4">Products</h2>
            <div className="space-y-4">
              {order.products.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product?.media?.[0] ? (
                      <Image
                        src={item.product.media[0]}
                        alt={item.product.title}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.title || "Product"}</h3>
                    <p className="text-sm text-gray-600">Price: ${item.product?.price || 0}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Color: {item.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-heading4-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(order.totalAmount - (order.platformFee || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee:</span>
                <span>${(order.platformFee || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-body-bold">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-heading4-bold mb-4">Shipping Address</h2>
              <div className="text-small-medium space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Vendor Breakdown */}
          {order.vendorOrders && order.vendorOrders.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-heading4-bold mb-4">Vendor Breakdown</h2>
              <div className="space-y-4">
                {order.vendorOrders.map((vendorOrder: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">{vendorOrder.vendor?.businessName || "Unknown Vendor"}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendorOrder.status)}`}>
                        {STATUS_OPTIONS.find(s => s.value === vendorOrder.status)?.label || vendorOrder.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Products:</span>
                        <span>{vendorOrder.products?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${(vendorOrder.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Commission:</span>
                        <span>${(vendorOrder.commission || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-green-600">
                        <span>Vendor Earnings:</span>
                        <span>${(vendorOrder.vendorEarnings || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span className="font-medium">{vendorOrder.status}</span>
                      </div>
                    </div>

                    {/* STATUS DROPDOWN - This is what you wanted! */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status:
                      </label>
                      <select
                        value={vendorOrder.status}
                        onChange={(e) => updateVendorOrderStatus(vendorOrder.vendor._id, e.target.value)}
                        disabled={updatingVendorStatus === vendorOrder.vendor._id}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingVendorStatus === vendorOrder.vendor._id && (
                        <p className="text-xs text-blue-600 mt-1">Updating status...</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Customer will see: "{STATUS_OPTIONS.find(s => s.value === vendorOrder.status)?.description}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;