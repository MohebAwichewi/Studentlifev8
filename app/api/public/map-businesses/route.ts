import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        // Parse URL to get query parameters (optional for future filtering)
        const { searchParams } = new URL(req.url)
        const userLat = searchParams.get('lat')
        const userLng = searchParams.get('lng')

        // Fetch all businesses with active deals and valid coordinates
        const businesses = await prisma.business.findMany({
            where: {
                status: 'APPROVED',
                latitude: { not: 0 },
                longitude: { not: 0 },
                deals: {
                    some: {
                        status: { in: ['APPROVED', 'ACTIVE'] },
                        OR: [
                            { expiry: null },
                            { expiry: { gt: new Date() } }
                        ]
                    }
                }
            },
            select: {
                id: true,
                businessName: true,
                logo: true,
                latitude: true,
                longitude: true,
                category: true,
                deals: {
                    where: {
                        status: { in: ['APPROVED', 'ACTIVE'] },
                        OR: [
                            { expiry: null },
                            { expiry: { gt: new Date() } }
                        ]
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        discountValue: true,
                        image: true,
                        category: true,
                        isMultiUse: true,
                        createdAt: true,
                        expiry: true
                    },
                    take: 10 // Limit deals per business for performance
                }
            }
        })

        // Transform to include deal count
        const businessesWithCount = businesses.map(business => ({
            ...business,
            dealCount: business.deals.length
        }))

        return NextResponse.json({
            success: true,
            businesses: businessesWithCount,
            count: businessesWithCount.length
        })

    } catch (error) {
        console.error("Map Businesses Error:", error)
        return NextResponse.json({
            success: false,
            businesses: [],
            error: "Server Error"
        }, { status: 500 })
    }
}
