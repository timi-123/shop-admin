// app/(dashboard)/orders/[orderId]/page.tsx (ADMIN PROJECT)
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Vendor from "@/lib/models/Vendor";
import Image from "next/image";

// Direct database function to get order details
const getOrderDetails = async (orderId: string) => {
  try {
    await connectToDB();

    const order = await Order.findById(orderId)
      .populate({
        path: "products.product",
        model: Product,
        select: "title media price"
      })
      .populate({
        path: "vendorOrders.vendor",
        model: Vendor,
        select: "businessName email"
      });

    if (!order) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
};

const OrderDetails = async ({ params }: { params: { orderId: string } }) => {
  const order = await getOrderDetails(params.orderId);

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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "processing" ? "bg-blue-100 text-blue-800" :
                  order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                  order.status === "delivered" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Payment Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                  order.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Order Date</p>
                <p className="text-body-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-small-medium text-grey-2">Customer</p>
                <p className="text-body-medium">{order.customerClerkId}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-heading4-bold mb-4">Products</h2>
            <div className="space-y-4">
              {order.products.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0">
                  {item.product?.media?.[0] ? (
                    <Image
                      src={item.product.media[0]}
                      alt={item.product.title || "Product"}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-body-bold">{item.product?.title || "Product Name"}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-small-medium">
                      <p>Price: ${item.priceAtTime}</p>
                      <p>Quantity: {item.quantity}</p>
                      {item.color && <p>Color: {item.color}</p>}
                      {item.size && <p>Size: {item.size}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body-bold">${(item.priceAtTime * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Totals */}
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

          {/* Vendor Orders */}
          {order.vendorOrders && order.vendorOrders.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-heading4-bold mb-4">Vendor Breakdown</h2>
              <div className="space-y-4">
                {order.vendorOrders.map((vendorOrder: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <p className="text-body-bold mb-2">
                      {vendorOrder.vendor?.businessName || "Vendor"}
                    </p>
                    <div className="text-small-medium space-y-1">
                      <div className="flex justify-between">
                        <span>Products:</span>
                        <span>{vendorOrder.products?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${vendorOrder.subtotal?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission:</span>
                        <span>${vendorOrder.commission?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-body-bold">
                        <span>Vendor Earnings:</span>
                        <span className="text-green-600">
                          ${vendorOrder.vendorEarnings?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          vendorOrder.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          vendorOrder.status === "processing" ? "bg-blue-100 text-blue-800" :
                          vendorOrder.status === "shipped" ? "bg-purple-100 text-purple-800" :
                          vendorOrder.status === "delivered" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {vendorOrder.status || "pending"}
                        </span>
                      </div>
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

export default OrderDetails;