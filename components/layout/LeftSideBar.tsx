// components/layout/LeftSideBar.tsx (UPDATED)
"use client"

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import { useRole } from "@/lib/hooks/useRole";
import { getNavLinks } from "@/lib/constants";

const LeftSideBar = () => {
  const pathname = usePathname();
  const params = useParams();
  const { role, isAdmin, isVendor } = useRole();
  const { user } = useUser();
  
  // Store userId in localStorage when user is loaded
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem('userId', user.id);
    }
  }, [user]);
  
  // Get vendorId from URL if admin is viewing a specific vendor
  const vendorId = params.vendorId as string;
  const navLinks = getNavLinks(role, vendorId);

  return (
    <div className="h-screen left-0 top-0 sticky p-10 flex flex-col gap-16 bg-blue-2 shadow-xl max-lg:hidden">
      <Image src="/logo.png" alt="logo" width={150} height={70} />

      <div className="flex flex-col gap-12">
        {navLinks.map((link) => (
          <Link
            href={link.url}
            key={link.label}
            className={`flex gap-4 text-body-medium ${
              pathname === link.url || 
              (pathname?.includes(link.url) && link.url !== '/') 
                ? "text-blue-1" 
                : "text-grey-1"
            }`}
          >
            {link.icon} <p>{link.label}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-4 text-body-medium items-center">
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10"
            }
          }}
        />
        <p>Edit Profile</p>
      </div>
    </div>
  );
};

export default LeftSideBar;