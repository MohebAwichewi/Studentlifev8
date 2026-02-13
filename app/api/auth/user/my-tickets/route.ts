import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // ✅ Get all TICKETS (Updated from Vouchers)
        const tickets = await prisma.ticket.findMany({
            where: { userId: user.id },
            include: {
                deal: {
                    include: {
                        business: {
                            select: {
                                businessName: true,
                                logo: true,
                                address: true,
                                latitude: true,
                                longitude: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Separate active and used tickets
        // Note: Map Prisma 'Ticket' structure to frontend expected structure
        const formattedTickets = tickets.map(t => ({
            id: t.id,
            code: t.code,
            qrData: t.qrData,
            createdAt: t.createdAt,
            isUsed: t.isUsed,
            usedAt: t.usedAt,
            deal: {
                id: t.deal.id,
                title: t.deal.title,
                description: t.deal.description,
                image: t.deal.image,
                expiry: t.deal.expiry,
                category: t.deal.category,
                business: {
                    businessName: t.deal.business.businessName,
                    logo: t.deal.business.logo,
                    address: t.deal.business.address,
                    latitude: t.deal.business.latitude,
                    longitude: t.deal.business.longitude
                }
            }
        }))

        return NextResponse.json({
            success: true,
            tickets: formattedTickets, // Sending unified list, frontend filters active/used
            totalActive: formattedTickets.filter(t => !t.isUsed).length,
            totalUsed: formattedTickets.filter(t => t.isUsed).length
        })

    } catch (error) {
        console.error('My Tickets Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
