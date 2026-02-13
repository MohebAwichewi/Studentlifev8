import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = params.id

        // Use transaction to delete related data if not handled by Cascade
        // Prisma schema usually handles cascading if configured, but let's be safe or just delete user 
        // and let DB handle cascade if foreign keys are set up that way.
        // Checking schema: Relations seem standard.

        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete User Error:", error)
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
