import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const deal = await prisma.deal.findUnique({
            where: { id }
        })

        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 })
        }

        return NextResponse.json(deal)
    } catch (error) {
        console.error("Deal Fetch Error:", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await req.json()
        const {
            title, description, discount, expiry, image,
            category, isMultiUse,
            // ✅ ALL EDITABLE FIELDS
            isUrgent, priorityScore, status, rejectionReason, subCategory, redemptionType
        } = body

        // Handle Date
        let validExpiry = null;
        if (expiry) {
            const d = new Date(expiry);
            if (!isNaN(d.getTime())) validExpiry = d;
        }

        const deal = await prisma.deal.update({
            where: { id },
            data: {
                title,
                description,
                discount: discount, // Maps correctly if frontend sends formatted string, or handle formatting here if needed. 
                // Frontend sends "20" or "20.00". We should format it if we want consistency, but sticking to simple update for now or trust frontend sent formatted string?
                // Wait, DealForm sends raw numbers/strings in `discount`. `add-deal` logic formatted it.
                // We need to format the discount string here or in frontend. 
                // Let's modify frontend (EditDealPage) to format it before sending or do it here. 
                // Given `api/auth/deals/create` did formatting: `const formattedDiscount = discountType === 'FIXED' ? ...`
                // I should replicate that logic here.

                // Let's assume BODY sends `discountType` and `discount` raw values?
                // My EditDealPage sends `discount` (value) and `discountType`.
                // So I need to format it here.
                discount: body.discountType === 'FIXED' ? `${body.discount} TND` : `${body.discount}%`,

                expiry: validExpiry,
                image: image || "",
                images: body.images || [],
                category,
                subCategory: body.subCategory || null,
                isMultiUse,

                // ✅ UPDATED FIELDS
                isFlashDeal: body.isFlashDeal || false,
                totalInventory: body.totalInventory ? parseInt(body.totalInventory) : null,
                maxClaimsPerUser: body.maxClaimsPerUser ? parseInt(body.maxClaimsPerUser) : 1,
                startDate: body.startDate ? new Date(`${body.startDate}T${body.startTime || '00:00'}`) : null,

                // Legacy or non-schema fields check
                // isUrgent: Boolean(isUrgent), // Removing as arguably not needed/schema mismatch for now unless added
                // priorityScore...
                status,
                rejectionReason,
            }
        })

        return NextResponse.json({ success: true, deal })

    } catch (error) {
        console.error("Deal Update Error:", error)
        return NextResponse.json({ error: "Failed to update deal" }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params
        const id = parseInt(params.id)
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        await prisma.deal.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Deal Delete Error:", error)
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
    }
}
