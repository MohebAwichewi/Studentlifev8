import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, pushToken } = body;

        if (!userId || !pushToken) {
            return NextResponse.json({ success: false, error: "User ID and Push Token are required" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { pushToken: pushToken }
        });

        return NextResponse.json({ success: true, message: "Push token saved" });

    } catch (error) {
        console.error("Save Push Token Error:", error);
        return NextResponse.json({ success: false, error: "Failed to save push token" }, { status: 500 });
    }
}
