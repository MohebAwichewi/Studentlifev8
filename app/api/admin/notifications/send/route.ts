import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, error: "Title and Message are required" }, { status: 400 });
        }

        // 1. Fetch all users with push tokens
        const users = await prisma.user.findMany({
            where: {
                pushToken: {
                    not: null
                }
            },
            select: { pushToken: true }
        });

        const pushTokens = users.map(u => u.pushToken).filter(t => t && Expo.isExpoPushToken(t)) as string[];

        if (pushTokens.length === 0) {
            return NextResponse.json({ success: false, error: "No registered devices found" }, { status: 404 });
        }

        // 2. Create messages
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: message,
            data: { withSome: 'data' },
        }));

        // 3. Send chunks
        const chunks = expo.chunkPushNotifications(messages as any);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("Error sending chunk:", error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Notification sent to ${pushTokens.length} devices`,
            recipientCount: pushTokens.length
        });

    } catch (error) {
        console.error("Send Notification Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
