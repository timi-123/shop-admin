// components/vendors/VendorOrderManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface VendorOrder {
  _id: string;
  customerClerkId: string;
  products: any[];
  subtotal: number;
  status: string;
  customerStatusMessage: string;
  statusHistory: any[];
  trackingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  lastStatusUpdate: string;
  createdAt: string;
}

interface VendorOrderManagementProps {
  vendorId: string;
}

const VendorOrderManagement = ({ vendorId }: VendorOrderManagementProps) => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
      const response = await fetch(`/api/vendors/${vendorId}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  const updateOrderStatus = async (
    orderId: string, 
    status: string, 
    trackingData?: { trackingNumber?: string; carrier?: string; estimatedDelivery?: string }
  ) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/vendors/${vendorId}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ...trackingData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Order status updated successfully");
        
        // Update the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status, customerStatusMessage: result.vendorOrder.customerStatusMessage }
              : order
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const StatusUpdateModal = ({ order, onClose }: { order: VendorOrder; onClose: () => void }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingInfo?.trackingNumber || "");
    const [carrier, setCarrier] = useState(order.trackingInfo?.carrier || "");
    const [estimatedDelivery, setEstimatedDelivery] = useState(
      order.trackingInfo?.estimatedDelivery ? order.trackingInfo.estimatedDelivery.split('T')[0] : ""
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
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

  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading3-bold">Manage Orders</h2>
        <p className="text-sm text-gray-600">{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders found</p>
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

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  disabled={updatingStatus === order._id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingStatus === order._id ? "Updating..." : "Update Status"}
                </button>
                
                {order.trackingInfo?.trackingNumber && (
                  <div className="text-sm text-gray-600 flex items-center">
                    Tracking: {order.trackingInfo.trackingNumber}
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
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default VendorOrderManagement;