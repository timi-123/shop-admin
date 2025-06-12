// components/auth/RoleGuard.tsx (FIXED RACE CONDITIONS)
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
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        // Only proceed when both user and role are fully loaded
        if (isLoaded && !roleLoading && role !== null) {
            const timer = setTimeout(() => {
                setInitialLoad(false);
                
                // Handle redirects for regular users
                if (user && role === "user") {
                    // Allow vendor application page for regular users
                    if (pathname?.includes("/vendor-application")) {
                        return;
                    }
                    
                    // Redirect regular users trying to access dashboard routes
                    if (pathname !== "/" && !pathname.includes("/sign-")) {
                        console.log("Redirecting user to vendor application page");
                        setRedirecting(true);
                        router.push("/vendor-application");
                        return;
                    }
                }
            }, 200); // Small delay to ensure smooth loading

            return () => clearTimeout(timer);
        }
    }, [isLoaded, user, role, roleLoading, router, pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    // Show loader during initial authentication and role checking
    // Wait for BOTH user and role to be loaded
    if (!isLoaded || roleLoading || role === null || initialLoad || redirecting) {
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
                <div className="max-w-md w-full text-center p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        You don&apos;t have permission to access this page. Only administrators and vendors can access the admin panel.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push("/vendor-application")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply to Become a Vendor
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleGuard;