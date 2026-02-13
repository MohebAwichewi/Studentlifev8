import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

        await prisma.deal.update({
            where: { id },
            data: { clicks: { increment: 1 } }
        })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Error" }, { status: 500 })
    }
}
