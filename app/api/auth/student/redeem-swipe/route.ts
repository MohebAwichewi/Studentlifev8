import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { email, dealId, userLat, userLng } = await req.json()

        // 1. Get Deal and Business Location
        const deal = await prisma.deal.findUnique({
            where: { id: Number(dealId) },
            include: { business: true }
        })

        if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 })

        // 2. Validate Student
        const student = await prisma.student.findUnique({ where: { email } })
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

        // 3. SERVER-SIDE LOCATION CHECK (Optional Double Check)
        // While frontend checks location for UI, backend can verify provided coords are plausible if needed.
        // For now, we trust the coords sent by the "verified" frontend state.

        // 4. CHECK COOLDOWN (The 5-minute rule)
        if (deal.isMultiUse) {
            const lastRedemption = await prisma.redemption.findFirst({
                where: {
                    studentId: student.id,
                    dealId: deal.id
                },
                orderBy: { createdAt: 'desc' }
            })

            if (lastRedemption) {
                const timeDiff = new Date().getTime() - new Date(lastRedemption.createdAt).getTime()
                const minutesDiff = Math.floor(timeDiff / 60000)

                if (minutesDiff < 5) {
                    const waitTime = 5 - minutesDiff
                    return NextResponse.json({ error: `Cooldown active. Try again in ${waitTime} minutes.` }, { status: 429 })
                }
            }
        } else {
            // Single use check
            const used = await prisma.redemption.findFirst({
                where: { studentId: student.id, dealId: deal.id }
            })
            if (used) return NextResponse.json({ error: "This offer has already been used." }, { status: 400 })
        }

        // ✅ 4.5 STOCK CHECK & DECREMENT
        if (deal.isSoldOut || (deal.stock !== -1 && deal.stock <= 0)) {
            return NextResponse.json({ error: "This deal is sold out!" }, { status: 400 })
        }

        // Decrement Stock (if not infinite) and Update SoldOut status
        if (deal.stock !== -1) {
            await prisma.deal.update({
                where: { id: deal.id },
                data: {
                    stock: { decrement: 1 },
                    isSoldOut: deal.stock - 1 <= 0 // Mark as sold out if we just took the last one
                }
            })
        }

        // 5. LOG REDEMPTION
        const redemption = await prisma.redemption.create({
            data: {
                studentId: student.id,
                dealId: deal.id,
            }
        })

        // ✅ FIX: GENERATE UNIQUE CODE FOR SWIPE DEALS TOO
        // This ensures even swipe deals have a code for reference/business dashboard
        const uniqueCode = `SL-SWP-${dealId.toString().slice(-4)}-${student.id.slice(-4)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

        await prisma.voucher.create({
            data: {
                code: uniqueCode,
                studentId: student.id,
                dealId: deal.id,
                isUsed: true // Mark as used immediately since it was a swipe
            }
        })

        return NextResponse.json({ success: true, message: "Redeemed successfully", code: uniqueCode })

    } catch (error) {
        console.error("Redemption Error", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}