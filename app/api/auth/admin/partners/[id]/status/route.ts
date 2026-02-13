import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { status, rejectionReason } = await req.json()

        // Validate Status
        const validStatuses = ['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED']
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const business = await prisma.business.update({
            where: { id: params.id },
            data: {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                isVerified: status === 'ACTIVE', // Auto-verify on approval
                // If suspending, maybe we should deactivate deals?
                // For now, let's keep it simple. The frontend will filter active deals based on business status if needed, 
                // or we can run a separate updateMany on deals.
            }
        })

        // TODO: Send Email Notification based on status change (Welcome, Rejection, etc.)

        return NextResponse.json({ success: true, business })
    } catch (error) {
        console.error("Update Status Error:", error)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }
}
