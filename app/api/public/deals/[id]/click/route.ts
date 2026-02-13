import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params

        // Increment clicks
        const updated = await prisma.deal.update({
            where: { id: Number(id) },
            data: {
                clicks: { increment: 1 } // Use the existing 'clicks' field which implies count
            }
        })

        return NextResponse.json({ success: true, clicks: updated.clicks })
    } catch (error) {
        console.error("Click Track Error:", error)
        return NextResponse.json({ error: "Failed to track click" }, { status: 500 })
    }
}
