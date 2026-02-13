import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: params.id }
        })

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
        }

        if (ticket.status === 'REDEEMED') {
            return NextResponse.json({ error: "Ticket already redeemed" }, { status: 400 })
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: params.id },
            data: {
                status: 'REDEEMED',
                usedAt: new Date(),
                // Start a redemption record if needed by your logic
            }
        })

        return NextResponse.json({ success: true, ticket: updatedTicket })
    } catch (error) {
        console.error("Manual Redeem Error:", error)
        return NextResponse.json({ error: "Failed to redeem ticket" }, { status: 500 })
    }
}
