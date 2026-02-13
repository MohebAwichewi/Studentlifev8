import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)

        // 1. Pagination & Sorting
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // 2. Filters
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'ALL' // ALL, PENDING, REDEEMED, EXPIRED

        // Construct Where Clause
        const where: Prisma.TicketWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { id: { contains: search, mode: 'insensitive' } }, // Ticket ID
                        { user: { fullName: { contains: search, mode: 'insensitive' } } },
                        { deal: { business: { businessName: { contains: search, mode: 'insensitive' } } } }
                    ]
                } : {},
                status !== 'ALL' ? {
                    status: status === 'REDEEMED' ? 'REDEEMED' :
                        status === 'EXPIRED' ? 'EXPIRED' :
                            'ACTIVE' // Default to pending/active
                } : {}
            ]
        }

        // 3. Fetch Data
        const [total, tickets] = await prisma.$transaction([
            prisma.ticket.count({ where }),
            prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, fullName: true, email: true } },
                    deal: {
                        select: {
                            id: true,
                            title: true,
                            discountPercentage: true,
                            business: { select: { id: true, businessName: true } }
                        }
                    }
                }
            })
        ])

        // 4. Transform & Fraud Detection
        const mappedTickets = tickets.map(t => {
            // Speed Check: Redeemed < 10s after creation
            const createdTime = new Date(t.createdAt).getTime()
            const redeemedTime = t.usedAt ? new Date(t.usedAt).getTime() : null
            const isSpeedRisk = redeemedTime ? (redeemedTime - createdTime) < 10000 : false

            // Status Logic (if not explicitly stored as status string in some legacy rows)
            let displayStatus = t.status
            if (!t.usedAt && new Date(t.expiresAt) < new Date()) {
                displayStatus = 'EXPIRED'
            }

            return {
                id: t.id,
                code: t.qrCode,
                deal: {
                    title: t.deal.title,
                    discount: t.deal.discountPercentage,
                    businessName: t.deal.business.businessName
                },
                user: {
                    name: t.user.fullName,
                    email: t.user.email
                },
                status: displayStatus,
                createdAt: t.createdAt,
                redeemedAt: t.usedAt,
                isFraudRisk: isSpeedRisk // Flag for UI
            }
        })

        return NextResponse.json({
            success: true,
            tickets: mappedTickets,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error("Ticket List Error:", error)
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }
}
