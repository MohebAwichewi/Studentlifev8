import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { userId, action } = await req.json() // action: 'BAN' | 'UNBAN'

        if (!userId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

        const isBanned = action === 'BAN';

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isBanned: isBanned }
        })

        return NextResponse.json({ success: true, user: updatedUser })

    } catch (error) {
        console.error("User Action Error", error)
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 })
    }
}

