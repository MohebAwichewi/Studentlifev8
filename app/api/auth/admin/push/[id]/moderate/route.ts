import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { action, reason } = await req.json() // action: 'APPROVE', 'REJECT', 'SEND'
        const id = parseInt(params.id)

        if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        if (action === 'REJECT' && !reason) {
            return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
        }

        let updateData: any = {}

        if (action === 'APPROVE') {
            updateData = { status: 'APPROVED' }
        } else if (action === 'REJECT') {
            updateData = { status: 'REJECTED', rejectionReason: reason }
        } else if (action === 'SEND') {
            // "Send Now" logic
            // 1. Check if approved (optional, or just force send)
            // 2. Integration with OneSignal/FCM would land here
            // 3. Update status
            updateData = { status: 'SENT', sentAt: new Date() }

            // Mock Integration Log
            console.log(`[PUSH-BROADCAST] Triggering Push ID ${id}... Success.`)
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const updatedRequest = await prisma.pushRequest.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ success: true, request: updatedRequest })

    } catch (error) {
        console.error("Moderate Push Error:", error)
        return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
    }
}
