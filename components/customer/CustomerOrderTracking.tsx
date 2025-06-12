// components/customer/CustomerOrderTracking.tsx
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

interface VendorStatus {
  vendorName: string;
  status: string;
  customerMessage: string;
  lastUpdate: string;
  trackingInfo?: {
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  };
  products: any[];
  productCount: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  customerStatusSummary: string;
  vendorStatusBreakdown: VendorStatus[];
  hasShippedItems: boolean;
  hasDeliveredItems: boolean;
  allItemsDelivered: boolean;
  products: any[];
}

interface CustomerOrderTrackingProps {
  customerId: string;
}

const CustomerOrderTracking = ({ customerId }: CustomerOrderTrackingProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_received':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_production':
        return <Package className="w-4 h-4 text-yellow-500" />;
      case 'ready_to_ship':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'order_received': 'bg-blue-100 text-blue-800',
      'in_production': 'bg-yellow-100 text-yellow-800',
      'ready_to_ship': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId && customerId !== 'null' && customerId !== 'undefined') {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  const OrderDetailsModal = ({ order, onClose }: { order: Order; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Order #{order._id.slice(-8)}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Order Status</h4>
              <p className="text-lg text-blue-600 font-medium">{order.customerStatusSummary}</p>
              <p className="text-sm text-gray-600 mt-1">
                Ordered on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Status by Vendor</h4>
              {order.vendorStatusBreakdown.map((vendor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium">{vendor.vendorName}</h5>
                      <p className="text-sm text-gray-600">{vendor.productCount} item(s)</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {getStatusIcon(vendor.status)}
                        {vendor.customerMessage}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated {new Date(vendor.lastUpdate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {vendor.trackingInfo && (vendor.trackingInfo.trackingNumber || vendor.trackingInfo.carrier) && (
                    <div className="bg-blue-50 rounded p-3 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Tracking Information</span>
                      </div>
                      {vendor.trackingInfo.trackingNumber && (
                        <p className="text-sm">
                          <span className="font-medium">Tracking #:</span> {vendor.trackingInfo.trackingNumber}
                        </p>
                      )}
                      {vendor.trackingInfo.carrier && (
                        <p className="text-sm">
                          <span className="font-medium">Carrier:</span> {vendor.trackingInfo.carrier}
                        </p>
                      )}
                      {vendor.trackingInfo.estimatedDelivery && (
                        <p className="text-sm">
                          <span className="font-medium">Est. Delivery:</span> {new Date(vendor.trackingInfo.estimatedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  {item.product?.media?.[0] && (
                    <img 
                      src={item.product.media[0]} 
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{item.product?.title || 'Product'}</h5>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} • ${item.priceAtTime?.toFixed(2)}
                    </p>
                    {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                    {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading your orders...</span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">When you place orders, you'll see them here with real-time tracking.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <p className="text-gray-600">{orders.length} order(s)</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Order #{order._id.slice(-8)}</h3>
                <p className="text-gray-600">
                  ${order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {order.allItemsDelivered ? (
                  <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    All items delivered
                  </span>
                ) : order.hasShippedItems ? (
                  <span className="inline-flex items-center gap-2 text-orange-600 font-medium">
                    <Truck className="w-5 h-5" />
                    Items shipped
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-blue-600 font-medium">
                    <Clock className="w-5 h-5" />
                    Processing
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">Current Status:</p>
              <p className="font-medium text-blue-600">{order.customerStatusSummary}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">Vendor Updates:</p>
              <div className="space-y-2">
                {order.vendorStatusBreakdown.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{vendor.vendorName}:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(vendor.status)}`}>
                      {getStatusIcon(vendor.status)}
                      {vendor.customerMessage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(order)}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details & Tracking
            </button>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default CustomerOrderTracking;