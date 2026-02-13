import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch Campaign History
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: "Business ID required" }, { status: 400 });
        }

        const campaigns = await prisma.pushRequest.findMany({
            where: { businessId },
            include: {
                deal: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, campaigns });
    } catch (error) {
        console.error("Fetch Campaigns Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Request New Push Campaign
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { businessId, title, message, targetRadius, dealId } = body;

        // Validation
        if (!businessId || !title || !message) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        if (message.length > 140) {
            return NextResponse.json({ success: false, error: "Message exceeds 140 characters" }, { status: 400 });
        }

        if (targetRadius > 10000) { // 10km limit check (frontend sends meters)
            return NextResponse.json({ success: false, error: "Radius cannot exceed 10km" }, { status: 400 });
        }

        const newCampaign = await prisma.pushRequest.create({
            data: {
                businessId,
                title,
                message,
                targetRadius: targetRadius || 2000, // Default 2km
                dealId: dealId ? parseInt(dealId) : null,
                status: 'PENDING' // Always Pending initially
            }
        });

        return NextResponse.json({ success: true, campaign: newCampaign });

    } catch (error) {
        console.error("Create Campaign Error:", error);
        return NextResponse.json({ success: false, error: "Failed to request campaign" }, { status: 500 });
    }
}
