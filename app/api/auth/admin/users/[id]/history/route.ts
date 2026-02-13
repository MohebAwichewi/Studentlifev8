import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id

        const [tickets, redemptions] = await prisma.$transaction([
            prisma.ticket.findMany({
                where: { userId },
                include: {
                    deal: { select: { title: true, business: { select: { businessName: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.redemption.findMany({
                where: { userId },
                include: {
                    deal: { select: { title: true, business: { select: { businessName: true } } } }
                },
                orderBy: { usedAt: 'desc' }
            })
        ])

        return NextResponse.json({
            success: true,
            history: {
                tickets: tickets.map(t => ({
                    id: t.id,
                    type: 'CLAIM',
                    deal: t.deal.title,
                    business: t.deal.business.businessName,
                    date: t.createdAt,
                    status: t.status
                })),
                redemptions: redemptions.map(r => ({
                    id: r.id,
                    type: 'REDEMPTION',
                    deal: r.deal.title,
                    business: r.deal.business.businessName,
                    date: r.usedAt
                }))
            }
        })

    } catch (error) {
        console.error("User History Error:", error)
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
    }
}
