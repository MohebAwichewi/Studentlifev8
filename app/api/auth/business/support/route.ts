import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create Support Ticket
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { businessId, subject, message, priority } = body;

        if (!businessId || !subject || !message) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                businessId,
                subject,
                message,
                priority: priority || 'NORMAL',
                status: 'OPEN'
            }
        });

        return NextResponse.json({ success: true, ticket });

    } catch (error) {
        console.error("Create Support Ticket Error:", error);
        return NextResponse.json({ success: false, error: "Failed to submit ticket" }, { status: 500 });
    }
}
