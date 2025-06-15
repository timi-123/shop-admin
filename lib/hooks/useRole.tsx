// lib/hooks/useRole.tsx (FIXED - Prevents duplicate requests)
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export const useRole = () => {
    const { user, isLoaded } = useUser();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchingRef = useRef(false);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            // Prevent duplicate requests
            if (fetchingRef.current) {
                console.log("Role fetch already in progress, skipping");
                return;
            }

            // Don't try to fetch if user is not loaded
            if (!isLoaded) {
                return;
            }
            
            if (!user) {
                setLoading(false);
                setRole(null);
                return;
            }            // Check if we already have a role for this user
            const cachedRole = localStorage.getItem(`role_${user.id}`);
            const roleCacheTime = localStorage.getItem(`role_cache_time_${user.id}`);
            
            // Only use cache if it exists, isn't null, and isn't older than 5 minutes
            if (cachedRole && cachedRole !== 'null' && roleCacheTime) {
                const cacheAge = Date.now() - parseInt(roleCacheTime);
                if (cacheAge < 5 * 60 * 1000) { // 5 minutes
                    console.log("Using cached role:", cachedRole);
                    setRole(cachedRole);
                    setLoading(false);
                    return;
                } else {
                    console.log("Cached role is stale, refreshing");
                    // Clear stale cache
                    localStorage.removeItem(`role_${user.id}`);
                    localStorage.removeItem(`role_cache_time_${user.id}`);
                }
            }

            fetchingRef.current = true;
            setLoading(true);            try {
                // Store user ID in localStorage for reference
                localStorage.setItem('userId', user.id);
                
                console.log("Fetching role for user:", user.id);
                
                // Use a timestamp to avoid fetching role too frequently
                const now = Date.now();
                const lastRoleFetchTime = localStorage.getItem(`lastRoleFetch_${user.id}`);
                const shouldFetchRole = !lastRoleFetchTime || (now - parseInt(lastRoleFetchTime, 10)) > 60000; // 1 minute
                
                if (!shouldFetchRole) {
                    console.log("Skipping role fetch - recently fetched");
                    fetchingRef.current = false;
                    setLoading(false);
                    return;
                }
                
                const response = await fetch("/api/role", {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Role fetched successfully:", data.role);
                    setRole(data.role);
                    // Cache the role for 5 minutes
                    localStorage.setItem(`role_${user.id}`, data.role);
                    localStorage.setItem(`role_cache_time_${user.id}`, Date.now().toString());
                } else if (response.status === 404) {
                    console.log("Role doesn't exist, creating it...");
                    
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
                        console.log("Role created successfully:", data.role);
                        setRole(data.role);
                        localStorage.setItem(`role_${user.id}`, data.role);
                        localStorage.setItem(`role_cache_time_${user.id}`, Date.now().toString());
                    } else {
                        console.error("Failed to create role, defaulting to user");
                        setRole("user");
                        localStorage.setItem(`role_${user.id}`, "user");
                    }
                } else {
                    console.error(`Role API returned ${response.status}, defaulting to user`);
                    setRole("user");
                    localStorage.setItem(`role_${user.id}`, "user");
                }
            } catch (error) {
                console.error("Error fetching role:", error);
                setRole("user");
                localStorage.setItem(`role_${user.id}`, "user");
            } finally {
                setLoading(false);
                fetchingRef.current = false;
            }
        };

        // Clear any existing timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
        }

        // Check cache validity (5 minutes)
        if (user) {
            const cacheTime = localStorage.getItem(`role_cache_time_${user.id}`);
            if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
                const cachedRole = localStorage.getItem(`role_${user.id}`);
                if (cachedRole && cachedRole !== 'null') {
                    setRole(cachedRole);
                    setLoading(false);
                    return;
                }
            }
        }

        fetchRole();

        // Cleanup on unmount
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            fetchingRef.current = false;
        };
    }, [user?.id, isLoaded]); // Only depend on user.id and isLoaded

    return { 
        role, 
        loading, 
        isAdmin: role === "admin" || role === "superadmin", 
        isVendor: role === "vendor", 
        isUser: role === "user" 
    };
};