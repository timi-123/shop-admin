// app/(vendors)/[vendorId]/orders/page.tsx - Debug Version with Console Logs
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
        console.log("📊 Number of orders:", data.length);
        
        if (data.length > 0) {
          console.log("🔍 First order sample:", data[0]);
          console.log("🏷️ First order status:", data[0].status);
        }
        
        setOrders(data);
      } else {
        const errorData = await response.json();
        console.error("❌ API Error:", response.status, errorData);
        setError(`Failed to fetch orders: ${errorData.error || 'Unknown error'}`);
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("💥 Network error fetching orders:", error);
      setError("Network error - check console for details");
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.vendorId) {
      console.log("🚀 Component mounted with vendorId:", params.vendorId);
      fetchOrders();
    } else {
      console.error("❌ No vendorId found in params");
      setError("No vendor ID provided");
      setLoading(false);
    }
  }, [params.vendorId]);

  const updateOrderStatus = async (
    orderId: string, 
    status: string, 
    trackingData?: { trackingNumber?: string; carrier?: string; estimatedDelivery?: string }
  ) => {
    console.log("🔄 Updating order status:", { orderId, status, trackingData });
    setUpdatingStatus(orderId);
    
    try {
      const requestBody = {
        status,
        ...trackingData
      };
      
      console.log("📤 API Request body:", requestBody);
      
      const response = await fetch(`/api/vendors/${params.vendorId}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 Status update response:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Status updated successfully:", result);
        toast.success("Order status updated successfully");
        
        // Update the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  status, 
                  customerStatusMessage: result.vendorOrder?.customerStatusMessage || 
                    STATUS_OPTIONS.find(s => s.value === status)?.description || 
                    status 
                }
              : order
          )
        );
      } else {
        const error = await response.json();
        console.error("❌ Status update error:", error);
        toast.error(error.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("💥 Network error updating status:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const StatusUpdateModal = ({ order, onClose }: { order: VendorOrder; onClose: () => void }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [carrier, setCarrier] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");

    console.log("🎭 Modal opened for order:", order._id, "current status:", order.status);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("📝 Form submitted with:", { selectedStatus, trackingNumber, carrier, estimatedDelivery });
      
      const trackingData = selectedStatus === "shipped" ? {
        trackingNumber: trackingNumber.trim() || undefined,
        carrier: carrier.trim() || undefined,
        estimatedDelivery: estimatedDelivery || undefined
      } : {};

      updateOrderStatus(order._id, selectedStatus, trackingData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-4">Update Order Status</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Customer will see: "{STATUS_OPTIONS.find(o => o.value === selectedStatus)?.description}"
              </p>
            </div>

            {selectedStatus === "shipped" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tracking Number (Optional)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Enter tracking number"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Carrier (Optional)</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., UPS, FedEx, DHL"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Estimated Delivery (Optional)</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
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
                  <p className="text-sm text-gray-600">
                    Customer: {order.customerClerkId}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer sees: "{order.customerStatusMessage || 'No message'}"
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

              {order.shippingAddress && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Shipping Address:</p>
                  <p className="text-sm">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("🎯 Update Status button clicked for order:", order._id);
                    setSelectedOrder(order);
                  }}
                  disabled={updatingStatus === order._id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingStatus === order._id ? "Updating..." : "Update Status"}
                </button>
                
                <button
                  onClick={() => console.log("📊 Order details:", order)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Debug Order
                </button>
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