import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch Settings
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: {
                language: true,
                timezone: true,
                emailNotifications: true,
                pushNotifications: true,
                email: true
            }
        });

        return NextResponse.json({ success: true, settings: business });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update Settings
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { businessId, language, timezone, emailNotifications, pushNotifications } = body;

        await prisma.business.update({
            where: { id: businessId },
            data: {
                language,
                timezone,
                emailNotifications,
                pushNotifications
            }
        });

        return NextResponse.json({ success: true, message: "Settings updated" });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
    }
}

// DELETE: Delete Account
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

        // In a real app, we might soft delete or archive. Here we delete.
        await prisma.business.delete({
            where: { id: businessId }
        });

        return NextResponse.json({ success: true, message: "Account deleted" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 });
    }
}
