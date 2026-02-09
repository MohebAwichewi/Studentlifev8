import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            title, description, discount, expiry, image,
            businessId, category, isMultiUse, redemptionType
        } = body

        if (!businessId) {
            return NextResponse.json({ error: "Missing Business ID. Please re-login." }, { status: 400 })
        }

        // 1. Verify Business actually exists
        const businessExists = await prisma.business.findUnique({
            where: { id: businessId }
        })

        if (!businessExists) {
            return NextResponse.json({ error: "Business account not found." }, { status: 404 })
        }

        // 2. Handle Date
        let validExpiry = null;
        if (expiry) {
            const d = new Date(expiry);
            if (!isNaN(d.getTime())) validExpiry = d;
        }

        // 3. Create Deal
        // Deals start as PENDING and require admin approval
        const deal = await prisma.deal.create({
            data: {
                title,
                description: description || "",
                discountValue: discount || "",
                expiry: validExpiry,
                image: image || "",
                category: category || "General",
                status: 'PENDING', // ✅ Requires admin approval
                stock: -1, // ✅ Default to Unlimited (User Requested)
                views: 0,
                claimed: 0,
                isMultiUse: isMultiUse || false,
                isUrgent: false, // Default to false for now, or add to body destructuring if needed
                redemptionType: redemptionType || 'SWIPE',
                business: {
                    connect: { id: businessId }
                }
            }
        })

        return NextResponse.json({ success: true, deal })

    } catch (error: any) {
        console.error("Deal Create Error:", error)
        return NextResponse.json({ error: "Failed to create deal: " + error.message }, { status: 500 })
    }
}