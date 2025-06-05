// components/auth/RoleGuard.tsx (FIXED VERSION)
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Loader from "@/components/custom ui/Loader";
import { useRole } from "@/lib/hooks/useRole";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const RoleGuard = ({
                       children,
                       allowedRoles = ["admin", "vendor"]
                   }: RoleGuardProps) => {
    const { isLoaded, user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const pathname = usePathname();
    const { role, loading: roleLoading } = useRole();
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (isLoaded && !roleLoading) {
            // Add a small delay to prevent flash and allow proper role loading
            const timer = setTimeout(() => {
                setInitialLoad(false);
                
                if (user && role === "user" && !pathname.includes("/vendor-application")) {
                    router.push("/vendor-application");
                }
            }, 200); // Small delay to ensure smooth loading

            return () => clearTimeout(timer);
        }
    }, [isLoaded, user, role, roleLoading, router, pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/"); // Redirect to landing page after sign out
    };

    // Show loader during initial authentication and role checking
    if (!isLoaded || roleLoading || initialLoad) {
        return <Loader />;
    }

    // If no user, let the page handle it (will show landing page)
    if (!user) {
        return <>{children}</>;
    }

    // Allow vendor application page for all authenticated users
    if (pathname?.includes("/vendor-application")) {
        return <>{children}</>;
    }

    // Allow root page for all users (landing page logic is handled there)
    if (pathname === "/") {
        return <>{children}</>;
    }
    
    // Show access denied only for users trying to access protected routes
    if (role === "user" && !allowedRoles.includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        You don&apos;t have permission to access this page. Only administrators and vendors can access the admin panel.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push("/vendor-application")}
                            className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-2"
                        >
                            Apply to Become a Vendor
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="inline-block w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Sign Out and Use Different Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If we reach here, user has proper access
    return <>{children}</>;
};

export default RoleGuard;