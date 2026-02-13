import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch Notifications
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
        }

        const notifications = await prisma.notification.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { businessId, isRead: false }
        });

        return NextResponse.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Mark as Read (Single or All)
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, businessId, markAll } = body;

        if (markAll && businessId) {
            await prisma.notification.updateMany({
                where: { businessId, isRead: false },
                data: { isRead: true }
            });
            return NextResponse.json({ success: true, message: "All marked as read" });
        }

        if (id) {
            await prisma.notification.update({
                where: { id },
                data: { isRead: true }
            });
            return NextResponse.json({ success: true, message: "Marked as read" });
        }

        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });

    } catch (error) {
        console.error("Update Notification Error:", error);
        return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 });
    }
}

// DELETE: Clear All Notifications
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
        }

        await prisma.notification.deleteMany({
            where: { businessId }
        });

        return NextResponse.json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        console.error("Clear Notifications Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
