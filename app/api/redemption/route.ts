import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { studentId, dealId } = await req.json()

        if (!studentId || !dealId) {
            return NextResponse.json({ success: false, error: "Missing Student or Deal ID" }, { status: 400 })
        }

        // 1. Create Redemption Record
        // Note: dealId from mobile might be string or int. Ensure int.
        const dealIdInt = parseInt(dealId.toString())

        const redemption = await prisma.redemption.create({
            data: {
                studentId: studentId,
                dealId: dealIdInt
            }
        })

        // 2. Update Deal Stats (Claimed Count)
        await prisma.deal.update({
            where: { id: dealIdInt },
            data: {
                claimed: { increment: 1 }
            }
        })

        return NextResponse.json({ success: true, redemption })

    } catch (error) {
        console.error("Redemption Creation Error:", error)
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 })
    }
}
