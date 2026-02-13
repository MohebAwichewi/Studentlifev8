import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // Check if business exists
        const business = await prisma.business.findUnique({
            where: { id: params.id }
        })

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 })
        }

        // Delete business (Cascade should handle related deals/tickets if configured, 
        // otherwise we might need to delete them explicitly or soft delete)
        // Verified schema: Deal -> businessId (Cascade), Ticket -> businessId (Cascade)
        // So safe to delete.

        await prisma.business.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete Business Error:", error)
        return NextResponse.json({ error: "Failed to delete business" }, { status: 500 })
    }
}
