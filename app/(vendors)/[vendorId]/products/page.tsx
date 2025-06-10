// app/(vendors)/[vendorId]/products/page.tsx (ADMIN PROJECT)
import { getVendorProducts } from "@/lib/actions/actions";
import Link from "next/link";
import Image from "next/image";

const VendorProducts = async ({ params }: { params: { vendorId: string } }) => {
  const products = await getVendorProducts(params.vendorId);

  return (
    <div className="px-10 py-5">
      <div className="flex items-center justify-between mb-8">
        <p className="text-heading2-bold">Products</p>
        <div className="bg-grey-1 p-4 rounded-lg">
          <p className="text-small-medium">Total Products: {products.length}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body-medium text-grey-2">No products found</p>
          <Link 
            href={`/vendors/${params.vendorId}/products/new`}
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative">
                <Image
                  src={product.media[0] || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-body-bold mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-small-medium text-grey-2 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-small-medium">
                  <div>
                    <span className="text-grey-2">Price:</span>
                    <p className="text-body-bold">${product.price}</p>
                  </div>
                  <div>
                    <span className="text-grey-2">Stock:</span>
                    <p className="text-body-bold">{product.stockQuantity || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isApproved 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {product.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/vendors/${params.vendorId}/products/${product._id}`}
                    className="text-blue-600 hover:text-blue-800 text-small-medium"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Button */}
      <div className="fixed bottom-6 right-6">
        <Link 
          href={`/vendors/${params.vendorId}/products/new`}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default VendorProducts;