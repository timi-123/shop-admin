"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const TestRolePage = () => {
    const { user } = useUser();
    const [roleData, setRoleData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await fetch("/api/role");
                const data = await response.json();
                setRoleData(data);
            } catch (error) {
                console.error("Error fetching role:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRole();
        }
    }, [user]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Role Test Page</h1>

            <div className="space-y-2">
                <p><strong>User Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Current Role:</strong> {roleData?.role || "No role found"}</p>
            </div>

            <button
                onClick={async () => {
                    const response = await fetch("/api/role/update");
                    const data = await response.json();
                    console.log("Update response:", data);
                    window.location.reload();
                }}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Update Role
            </button>
        </div>
    );
};

export default TestRolePage;