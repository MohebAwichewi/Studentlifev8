import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, subDays, startOfMonth, parseISO, endOfDay } from 'date-fns'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const businessId = searchParams.get('businessId')
        const range = searchParams.get('range') || 'today' // today, week, month, custom
        const fromDate = searchParams.get('from')
        const toDate = searchParams.get('to')
        const search = searchParams.get('search') || ''

        if (!businessId) {
            return NextResponse.json({ error: "Missing Business ID" }, { status: 400 })
        }

        // 1. Date Filter Logic
        let whereClause: any = {
            deal: { businessId: businessId }
        }

        const now = new Date()

        if (range === 'today') {
            whereClause.createdAt = { gte: startOfDay(now) }
        } else if (range === 'week') {
            whereClause.createdAt = { gte: subDays(now, 7) }
        } else if (range === 'month') {
            whereClause.createdAt = { gte: startOfMonth(now) }
        } else if (range === 'custom' && fromDate && toDate) {
            whereClause.createdAt = {
                gte: startOfDay(parseISO(fromDate)),
                lte: endOfDay(parseISO(toDate))
            }
        }

        // 2. Search Logic (Customer Name or Deal Title)
        if (search) {
            whereClause.OR = [
                {
                    user: {
                        fullName: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    deal: {
                        title: { contains: search, mode: 'insensitive' }
                    }
                }
            ]
        }

        // 3. Fetch Data
        const redemptions = await prisma.redemption.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { fullName: true, id: true } // Fetch ID for masking logic if needed, or just name
                },
                deal: {
                    select: { title: true, discount: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for performance, maybe implement pagination later
        })

        // 4. Calculate Summary (Client side can do this, but nice to return total for the period)
        const totalRevenue = redemptions.reduce((acc, r) => acc + (r.redeemedAmount || 0), 0)
        const totalScans = redemptions.length

        return NextResponse.json({
            data: redemptions,
            summary: {
                totalRevenue,
                totalScans
            }
        })

    } catch (error) {
        console.error("Redemptions Fetch Error:", error)
        return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 })
    }
}
