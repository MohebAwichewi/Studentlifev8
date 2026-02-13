import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { ids } = await req.json()

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
        }

        await prisma.business.updateMany({
            where: { id: { in: ids } },
            data: {
                status: 'ACTIVE',
                isVerified: true
            }
        })

        // TODO: Trigger Bulk Welcome Emails

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Bulk Approve Error:", error)
        return NextResponse.json({ error: "Failed to bulk approve" }, { status: 500 })
    }
}
