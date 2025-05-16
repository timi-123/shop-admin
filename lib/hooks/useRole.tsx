// lib/hooks/useRole.tsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export const useRole = () => {
    const { user, isLoaded } = useUser();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            if (!isLoaded || !user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Store user ID in localStorage for reference
                localStorage.setItem('userId', user.id);
                
                const response = await fetch("/api/role");

                if (response.ok) {
                    const data = await response.json();
                    setRole(data.role);
                } else if (response.status === 404) {
                    // Role doesn't exist, create it
                    const createResponse = await fetch("/api/role", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: user.emailAddresses[0]?.emailAddress,
                        }),
                    });

                    if (createResponse.ok) {
                        const data = await createResponse.json();
                        setRole(data.role);
                    }
                }
            } catch (error) {
                console.error("Error fetching role:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [user, isLoaded]);

    return { 
        role, 
        loading, 
        isAdmin: role === "admin", 
        isVendor: role === "vendor", 
        isUser: role === "user" 
    };
};