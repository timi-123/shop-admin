// app/api/role/route.ts (FIXED - More robust authentication)
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Role from "@/lib/models/Role";
import { getRoleFromEmail } from "@/lib/roleConfig";

export async function GET(req: NextRequest) {
    try {
        console.log("=== ROLE API DEBUG ===");
        
        // First try to get userId from auth
        const { userId } = auth();
        console.log("Auth userId:", userId);

        if (!userId) {
            console.log("No userId from auth(), returning 401");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Add a small delay to ensure database connection is stable
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await connectToDB();
        console.log("DB connected successfully");

        // Try to find existing role
        let role = await Role.findOne({ clerkId: userId });
        console.log("Existing role found:", role?.role || "none");

        if (!role) {
            console.log("No role found, creating new one...");
            
            // Get user details to create role
            let user;
            try {
                user = await currentUser();
                console.log("Current user loaded:", user?.id || "none");
            } catch (userError) {
                console.error("Error loading current user:", userError);
                // Fallback: create role with default settings
                role = await Role.create({
                    clerkId: userId,
                    email: "temp@temp.com",
                    role: "user",
                    emailDomain: "temp.com",
                });
                await role.save();
                console.log("Created fallback role: user");
                return NextResponse.json({ role: "user" }, { status: 200 });
            }

            const email = user?.emailAddresses[0]?.emailAddress;
            console.log("User email:", email || "none");

            if (email) {
                const assignedRole = getRoleFromEmail(email);
                const emailDomain = email.split("@")[1];
                console.log("Assigned role:", assignedRole);

                role = await Role.create({
                    clerkId: userId,
                    email,
                    role: assignedRole,
                    emailDomain,
                });

                await role.save();
                console.log("Role created successfully:", assignedRole);
            } else {
                console.log("No email found, defaulting to user role");
                return NextResponse.json({ role: "user" }, { status: 200 });
            }
        }

        console.log("Returning role:", role.role);
        return NextResponse.json({ role: role.role }, { status: 200 });
    } catch (error) {
        console.error("Role API error:", error);
        // Return a default role instead of error to prevent infinite loops
        return NextResponse.json({ role: "user" }, { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log("=== ROLE POST API DEBUG ===");
        
        const { userId } = auth();
        console.log("POST Auth userId:", userId);

        if (!userId) {
            console.log("No userId from auth(), returning 401");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await req.json();
        console.log("Email from request:", email);

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await connectToDB();

        let userRole = await Role.findOne({ clerkId: userId });
        console.log("Existing role:", userRole?.role || "none");

        if (userRole) {
            // Update existing role if email changed
            if (userRole.email !== email) {
                const assignedRole = getRoleFromEmail(email);
                userRole.email = email;
                userRole.role = assignedRole;
                userRole.emailDomain = email.split("@")[1];
                await userRole.save();
                console.log("Updated existing role:", assignedRole);
            }
            return NextResponse.json({ role: userRole.role }, { status: 200 });
        }

        const assignedRole = getRoleFromEmail(email);
        const emailDomain = email.split("@")[1];
        console.log("Creating new role:", assignedRole);

        userRole = await Role.create({
            clerkId: userId,
            email,
            role: assignedRole,
            emailDomain,
        });

        await userRole.save();
        console.log("Role created successfully:", assignedRole);

        return NextResponse.json({ role: userRole.role }, { status: 201 });
    } catch (error) {
        console.error("Role POST API error:", error);
        return NextResponse.json({ role: "user" }, { status: 200 });
    }
}

export const dynamic = "force-dynamic";