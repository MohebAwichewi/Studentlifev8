
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const partners = await prisma.business.findMany({
            where: {}, // Fetch ALL partners (Pending, Active, Rejected)
            select: {
                id: true,
                businessName: true,
                email: true,
                status: true,
                logo: true,
                plan: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(partners)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
    }
}
