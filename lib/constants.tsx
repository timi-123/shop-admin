// lib/constants.tsx (Updated)
import {
  LayoutDashboard,
  Shapes,
  ShoppingBag,
  Tag,
  UsersRound,
  Store,
  FileText,
} from "lucide-react";

export const getNavLinks = (role: string | null, vendorId?: string) => {
  const baseLinks = [
    {
      url: "/",
      icon: <LayoutDashboard />,
      label: "Dashboard",
    },
  ];

  // Admin viewing a specific vendor - can now see vendor-specific data
  if (role === "admin" && vendorId) {
    return [
      ...baseLinks,
      {
        url: "/vendors",
        icon: <Store />,
        label: "Back to Vendors",
      },
      {
        url: `/vendors/${vendorId}`,
        icon: <Store />,
        label: "Vendor Details",
      },
      {
        url: `/vendors/${vendorId}/collections`,
        icon: <Shapes />,
        label: "Collections",
      },
      {
        url: `/vendors/${vendorId}/products`,
        icon: <Tag />,
        label: "Products",
      },
      {
        url: `/vendors/${vendorId}/orders`,
        icon: <ShoppingBag />,
        label: "Orders",
      },
    ];
  }

  // Admin main navigation - ONLY vendors and pending approvals
  if (role === "admin") {
    return [
      ...baseLinks,
      {
        url: "/vendors",
        icon: <Store />,
        label: "Vendors",
      },
      {
        url: "/pending-approvals",
        icon: <FileText />,
        label: "Pending Approvals",
      },
    ];
  }

  // Vendor navigation (can only see their own data)
  if (role === "vendor") {
    return [
      ...baseLinks,
      {
        url: "/my-collections",
        icon: <Shapes />,
        label: "My Collections",
      },
      {
        url: "/my-products",
        icon: <Tag />,
        label: "My Products",
      },
      {
        url: "/my-orders",
        icon: <ShoppingBag />,
        label: "My Orders",
      },
    ];
  }

  // Regular user (not vendor)
  return [
    ...baseLinks,
    {
      url: "/vendor-application",
      icon: <FileText />,
      label: "Become a Vendor",
    },
  ];
};