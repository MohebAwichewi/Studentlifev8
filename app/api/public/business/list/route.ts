import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const businesses = await prisma.business.findMany({
            where: {
                status: 'ACTIVE',
                // Ensure they have location data
                latitude: { not: null },
                longitude: { not: null }
            },
            select: {
                id: true,
                businessName: true,
                category: true,
                logo: true,
                coverImage: true,
                latitude: true,
                longitude: true,
                rating: true,
                description: true,
            }
        })

        return NextResponse.json(businesses)
    } catch (error) {
        console.error("Failed to fetch businesses map list", error)
        return NextResponse.json({ error: "Server Error" }, { status: 500 })
    }
}
