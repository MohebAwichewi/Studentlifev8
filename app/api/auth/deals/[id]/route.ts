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
                discountValue: discount,
                expiry: validExpiry,
                image,
                category,
                isMultiUse,
                // ✅ UPDATED FIELDS
                isUrgent: Boolean(isUrgent),
                priorityScore: priorityScore !== undefined ? parseInt(priorityScore) : undefined,
                status,
                rejectionReason,
                subCategory,
                redemptionType
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
