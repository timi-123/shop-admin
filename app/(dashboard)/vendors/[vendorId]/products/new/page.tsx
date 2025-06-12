// app/(dashboard)/vendors/[vendorId]/products/new/page.tsx - SIMPLIFIED
"use client";

import ProductForm from "@/components/products/ProductForm";
import PermissionGuard from "@/components/auth/PermissionGuard";

interface NewVendorProductPageProps {
  params: { vendorId: string };
}

const NewVendorProductPage: React.FC<NewVendorProductPageProps> = ({ params }) => {
  return (
    <PermissionGuard vendorId={params.vendorId}>
      <ProductForm vendorId={params.vendorId} isAdmin={true} />
    </PermissionGuard>
  );
};

export default NewVendorProductPage;