// components/auth/RoleGuard.tsx (Complete Updated Version)
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
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

    useEffect(() => {
        if (isLoaded && !roleLoading) {
            if (!user) {
                router.push("/sign-in");
                return;
            }

            // Allow regular users to access vendor application
            if (role === "user" && !pathname.includes("/vendor-application")) {
                router.push("/vendor-application");
                return;
            }

            if (role && !allowedRoles.includes(role) && !pathname.includes("/vendor-application")) {
                // Don't redirect, just show access denied for non-vendor/non-admin trying to access protected pages
            }
        }
    }, [isLoaded, user, role, roleLoading, allowedRoles, router, pathname]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/sign-in");
    };

    if (!isLoaded || roleLoading) {
        return <Loader />;
    }

    if (!user) {
        return <Loader />;
    }

    // Allow vendor application page for regular users
    if (pathname?.includes("/vendor-application")) {
        return <>{children}</>;
    }
    
    // If user doesn't have the correct role, show access denied
    if (role && !allowedRoles.includes(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        You don&apos;t have permission to access this page. Only administrators and vendors can access the admin panel.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={handleSignOut}
                            className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign Out and Sign In with Different Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleGuard;