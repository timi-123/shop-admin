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

        await connectToDB();

        let role = await Role.findOne({ clerkId: userId });

        if (!role) {
            const user = await currentUser();
            const email = user?.emailAddresses[0]?.emailAddress;

            if (email) {
                const assignedRole = getRoleFromEmail(email);
                const emailDomain = email.split("@")[1];

                role = await Role.create({
                    clerkId: userId,
                    email,
                    role: assignedRole,
                    emailDomain,
                });

                await role.save();
            } else {
                return NextResponse.json({ role: "user" }, { status: 200 });
            }
        }

        return NextResponse.json({ role: role.role }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await connectToDB();

        let userRole = await Role.findOne({ clerkId: userId });

        if (userRole) {
            return NextResponse.json({ role: userRole.role }, { status: 200 });
        }

        const assignedRole = getRoleFromEmail(email);
        const emailDomain = email.split("@")[1];

        userRole = await Role.create({
            clerkId: userId,
            email,
            role: assignedRole,
            emailDomain,
        });

        await userRole.save();

        return NextResponse.json({ role: userRole.role }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";