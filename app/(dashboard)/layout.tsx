import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import LeftSideBar from "@/components/layout/LeftSideBar";
import TopBar from "@/components/layout/TopBar";
import { ToasterProvider } from "@/lib/ToasterProvider";
import RoleGuard from "@/components/auth/RoleGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ShopGram - Admin Dashboard",
    description: "Admin dashboard to manage ShopGram's data",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <ToasterProvider />
            <RoleGuard>
                <div className="flex max-lg:flex-col text-grey-1">
                    <LeftSideBar />
                    <TopBar />
                    <div className="flex-1">{children}</div>
                </div>
            </RoleGuard>
            </body>
            </html>
        </ClerkProvider>
    );
}