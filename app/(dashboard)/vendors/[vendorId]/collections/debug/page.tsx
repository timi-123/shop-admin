// app/(dashboard)/vendors/[vendorId]/collections/debug/page.tsx
"use client";

import DebugCollectionForm from "@/components/debug/DebugCollectionForm";
import { useParams } from "next/navigation";

const DebugCollectionPage = () => {
  const params = useParams();
  
  return (
    <div>
      <DebugCollectionForm />
    </div>
  );
};

export default DebugCollectionPage;