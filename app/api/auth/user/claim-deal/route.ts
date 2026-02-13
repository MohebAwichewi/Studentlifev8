import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, dealId } = body;

        if (!email || !dealId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                redemptions: {
                    where: { dealId: parseInt(dealId) },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        // 2. Fetch Deal to check constraints
        const deal = await prisma.deal.findUnique({
            where: { id: parseInt(dealId) }
        });

        if (!deal) {
            return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
        }

        // 3. Logic: Single Use vs Multi Use checks
        // For now, assuming standard logic:

        // Check cooldown if needed (although app handles it, safer to double check)
        const lastRedemption = user.redemptions[0];
        if (lastRedemption) {
            const now = new Date();
            const lastTime = new Date(lastRedemption.createdAt);
            const diffMinutes = (now.getTime() - lastTime.getTime()) / 60000;

            // Example: 5 min cooldown for all deals to prevent spam
            if (diffMinutes < 5) {
                return NextResponse.json({ success: false, error: "Cooldown active. Please wait." }, { status: 429 });
            }
        }

        // 4. Generate Ticket
        // Create Ticket Record with Uniqueness Check
        let code = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 chars
            const userSuffix = user.id.substring(0, 2).toUpperCase(); // 2 chars from user for tracking
            code = `WIN-${userSuffix}-${randomCode}`; // Format: WIN-US-X829A1

            const existing = await prisma.ticket.findUnique({ where: { code } });
            if (!existing) isUnique = true;
            attempts++;
        }

        if (!isUnique) {
            return NextResponse.json({ success: false, error: "System busy, please try again." }, { status: 500 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                userId: user.id,
                dealId: parseInt(dealId),
                businessId: deal.businessId,
                code: code,
                qrData: code, // Scanning this code reveals the ticket
                isUsed: false
            },
            include: {
                deal: {
                    include: {
                        business: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            code: ticket.code,
            ticketId: ticket.id,
            dealTitle: ticket.deal.title,
            businessName: ticket.deal.business.businessName
        });

    } catch (error) {
        console.error("Claim Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
