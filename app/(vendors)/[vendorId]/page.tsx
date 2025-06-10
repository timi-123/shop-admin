import { getVendorDetails, getVendorOrders, getVendorProducts } from "@/lib/actions/actions";
import Link from "next/link";

const VendorDashboard = async ({ params }: { params: { vendorId: string } }) => {
  const vendor = await getVendorDetails(params.vendorId);
  const orders = await getVendorOrders(params.vendorId);
  const products = await getVendorProducts(params.vendorId);

  // Calculate revenue statistics
  const totalRevenue = orders.reduce((total: number, order: any) => {
    return total + (order.vendorEarnings || 0);
  }, 0);

  const totalCommission = orders.reduce((total: number, order: any) => {
    return total + (order.commission || 0);
  }, 0);

  const recentOrders = orders.slice(0, 5);

  if (!vendor) {
    return <div>Vendor not found</div>;
  }

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading2-bold">{vendor.businessName}</h1>
          <p className="text-body-medium text-grey-2">{vendor.email}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs ${
          vendor.status === "approved" ? "bg-green-100 text-green-800" :
          vendor.status === "pending" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800"
        }`}>
          {vendor.status}
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-body-bold text-grey-2">Total Revenue</h3>
          <p className="text-heading3-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-body-bold text-grey-2">Platform Fees</h3>
          <p className="text-heading3-bold text-red-1">${totalCommission.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-body-bold text-grey-2">Total Orders</h3>
          <p className="text-heading3-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-body-bold text-grey-2">Total Products</h3>
          <p className="text-heading3-bold">{products.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href={`/vendors/${params.vendorId}/orders`} 
              className="p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100">
          <h3 className="text-body-bold mb-2">Manage Orders</h3>
          <p className="text-small-medium text-grey-2">View and manage all orders</p>
          <p className="text-body-bold text-blue-600">{orders.length} orders</p>
        </Link>
        
        <Link href={`/vendors/${params.vendorId}/products`} 
              className="p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100">
          <h3 className="text-body-bold mb-2">Manage Products</h3>
          <p className="text-small-medium text-grey-2">View and manage all products</p>
          <p className="text-body-bold text-green-600">{products.length} products</p>
        </Link>
        
        <Link href={`/vendors/${params.vendorId}/collections`} 
              className="p-6 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100">
          <h3 className="text-body-bold mb-2">Manage Collections</h3>
          <p className="text-small-medium text-grey-2">View and manage collections</p>
          <p className="text-body-bold text-purple-600">View collections</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body-bold">Recent Orders</h3>
          <Link href={`/vendors/${params.vendorId}/orders`} 
                className="text-blue-600 hover:text-blue-800 text-small-medium">
            View All Orders
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <p className="text-grey-2">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-body-bold">Order #{order._id.slice(-8)}</p>
                  <p className="text-small-medium text-grey-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-body-bold text-green-600">${order.vendorEarnings.toFixed(2)}</p>
                  <p className="text-small-medium text-grey-2">{order.products.length} items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;