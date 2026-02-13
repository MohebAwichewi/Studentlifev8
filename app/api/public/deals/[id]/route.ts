import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const dealId = parseInt(params.id)

        if (isNaN(dealId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid deal ID' },
                { status: 400 }
            )
        }

        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                business: {
                    select: {
                        id: true,
                        businessName: true,
                        category: true,
                        city: true,
                        latitude: true,
                        longitude: true,
                        logo: true,
                        coverImage: true,
                        googleMapEmbed: true,
                        locations: {
                            select: {
                                id: true,
                                lat: true,
                                lng: true,
                                address: true
                            }
                        }
                    }
                }
            }
        })

        if (!deal) {
            return NextResponse.json(
                { success: false, error: 'Deal not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, deal })
    } catch (error) {
        console.error('Error fetching deal:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch deal' },
            { status: 500 }
        )
    }
}
