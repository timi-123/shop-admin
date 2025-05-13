import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import { connectToDB } from "@/lib/mongoDB";
import Role from "@/lib/models/Role";
import { getRoleFromEmail } from "@/lib/roleConfig";

export async function GET(req: NextRequest) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        await connectToDB();

        // Find or create role
        let role = await Role.findOne({ clerkId: userId });

        const assignedRole = getRoleFromEmail(email);
        const emailDomain = email.split("@")[1];

        if (!role) {
            // Create new role
            role = await Role.create({
                clerkId: userId,
                email,
                role: assignedRole,
                emailDomain,
            });
        } else {
            // Update existing role
            role.email = email;
            role.role = assignedRole;
            role.emailDomain = emailDomain;
        }

        await role.save();

        return NextResponse.json({
            message: "Role updated successfully",
            role: role.role,
            email: email
        }, { status: 200 });
    } catch (error) {
        console.error("[role_update_GET] Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";