import { getVendorOrders } from "@/lib/actions/actions";
import { DataTable } from "@/components/custom ui/DataTable";
import { columns } from "@/components/orders/OrderColumns";

const VendorOrders = async ({ params }: { params: { vendorId: string } }) => {
  const orders = await getVendorOrders(params.vendorId);

  // Calculate total revenue
  const totalRevenue = orders.reduce((total: number, order: any) => {
    return total + (order.vendorEarnings || 0);
  }, 0);

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-8">
        <p className="text-heading2-bold">Orders</p>
        <div className="bg-grey-1 p-4 rounded-lg">
          <p className="text-small-medium">Total Orders: {orders.length}</p>
          <p className="text-small-medium">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={orders} searchKey="customerName" />
    </div>
  );
};

export default VendorOrders;