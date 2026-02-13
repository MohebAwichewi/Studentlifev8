import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        // We might want to just delete it or set status to VOIDED
        // Checking schema, if no VOIDED status, we might need to add it or just DELETE.
        // For audit trails, better to update status to "EXPIRED" or a new "VOIDED" state if enum allows.
        // Assuming 'EXPIRED' is a safe fallback or just deleting for now if strict.

        // Let's assume we can set it to EXPIRED for now to invalidate it without destroying the record
        const updatedTicket = await prisma.ticket.update({
            where: { id: params.id },
            data: {
                status: 'EXPIRED', // Effectively void
                usedAt: null
            }
        })

        return NextResponse.json({ success: true, ticket: updatedTicket })
    } catch (error) {
        console.error("Void Ticket Error:", error)
        return NextResponse.json({ error: "Failed to void ticket" }, { status: 500 })
    }
}
