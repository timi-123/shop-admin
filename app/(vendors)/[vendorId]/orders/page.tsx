// app/(vendors)/[vendorId]/orders/page.tsx - COMPLETE REPLACEMENT
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface VendorOrder {
  _id: string;
  customerClerkId: string;
  products: any[];
  subtotal: number;
  status: string;
  customerStatusMessage: string;
  createdAt: string;
  shippingAddress: any;
  trackingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
}

const VendorOrdersManagement = () => {
  const params = useParams();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

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
      "cancelled": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const fetchOrders = async () => {
    try {
      console.log("🔍 Fetching orders for vendor:", params.vendorId);
      setError(null);
      
      const response = await fetch(`/api/vendors/${params.vendorId}/orders`);
      console.log("📡 API Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Orders fetched successfully:", data);
        setOrders(data);
      } else {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        setError(`Failed to fetch orders: ${response.status} ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("💥 Network error:", error);
      setError("Network error: Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.vendorId) {
      fetchOrders();
    }
  }, [params.vendorId]);

  // StatusUpdateModal Component
  const StatusUpdateModal = ({ order, onClose }: { order: VendorOrder; onClose: () => void }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingInfo?.trackingNumber || "");
    const [carrier, setCarrier] = useState(order.trackingInfo?.carrier || "");
    const [estimatedDelivery, setEstimatedDelivery] = useState(
      order.trackingInfo?.estimatedDelivery ? order.trackingInfo.estimatedDelivery.split('T')[0] : ""
    );
    const [customMessage, setCustomMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const requestBody: any = {
          status: selectedStatus
        };

        // Add tracking info if status is shipped
        if (selectedStatus === "shipped") {
          if (trackingNumber) requestBody.trackingNumber = trackingNumber;
          if (carrier) requestBody.carrier = carrier;
          if (estimatedDelivery) requestBody.estimatedDelivery = estimatedDelivery;
        }

        // Add custom message if provided
        if (customMessage.trim()) {
          requestBody.customMessage = customMessage.trim();
        }

        console.log("📝 Submitting status update:", requestBody);

        const response = await fetch(`/api/vendors/${params.vendorId}/orders/${order._id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Status updated successfully:", result);
          toast.success("Order status updated successfully");
          
          // Update the local state
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o._id === order._id 
                ? { 
                    ...o, 
                    status: selectedStatus, 
                    customerStatusMessage: result.vendorOrder?.customerStatusMessage || 
                      STATUS_OPTIONS.find(s => s.value === selectedStatus)?.description || 
                      selectedStatus,
                    trackingInfo: result.vendorOrder?.trackingInfo || o.trackingInfo
                  }
                : o
            )
          );
          
          onClose();
        } else {
          const error = await response.json();
          console.error("❌ Status update error:", error);
          toast.error(error.error || "Failed to update order status");
        }
      } catch (error) {
        console.error("💥 Network error updating status:", error);
        toast.error("Error updating order status");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Update Order Status</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">Order #{order._id.slice(-8)}</p>
            <p className="text-sm text-gray-500">Current status: {order.status}</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }} className="space-y-4">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Customer will see: "{STATUS_OPTIONS.find(s => s.value === selectedStatus)?.description}"
              </p>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Override the default customer message"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tracking Information (only for shipped status) */}
            {selectedStatus === "shipped" && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-700">Shipping Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g., UPS, FedEx, USPS"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Status"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading orders...</p>
          <p className="text-sm text-gray-500 mt-2">Vendor ID: {params.vendorId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-10 py-5">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Vendor ID: {params.vendorId}</p>
          <button 
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
          <div className="mt-4 text-left">
            <p className="text-sm text-gray-500">Debug info (check browser console for more details):</p>
            <p className="text-xs text-gray-400">API endpoint: /api/vendors/{params.vendorId}/orders</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading2-bold">Manage Orders</h1>
          <Link href={`/vendors/${params.vendorId}`} className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <p className="text-sm text-gray-500">Vendor ID: {params.vendorId}</p>
        </div>
        <p className="text-sm text-gray-600">{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders found</p>
          <p className="text-sm text-gray-500 mt-2">
            This vendor has not received any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} • ${order.subtotal.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer sees: "{order.customerStatusMessage}"
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Products ({order.products.length}):</p>
                <div className="text-sm space-y-1">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{product.product?.title || "Product"}</span>
                      <span>Qty: {product.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setSelectedOrder(order)}
                  disabled={updatingStatus === order._id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingStatus === order._id ? "Updating..." : "Update Status"}
                </button>
                
                {order.trackingInfo?.trackingNumber && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Tracking:</span> {order.trackingInfo.trackingNumber}
                    {order.trackingInfo.carrier && <span className="ml-2">({order.trackingInfo.carrier})</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => {
            console.log("❌ Modal closed");
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default VendorOrdersManagement;