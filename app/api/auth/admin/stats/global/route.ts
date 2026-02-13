import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // 1. Users Stats
        const totalUsers = await prisma.user.count()
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const newUsers = await prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } }
        })

        // 2. Business Stats
        const [activeBusinesses, pendingBusinesses, rejectedBusinesses, totalBusinesses] = await Promise.all([
            prisma.business.count({ where: { status: 'ACTIVE' } }),
            prisma.business.count({ where: { status: 'PENDING' } }),
            prisma.business.count({ where: { status: 'REJECTED' } }),
            prisma.business.count()
        ])

        // 3. Deals Stats
        const [activeDeals, expiredDeals] = await Promise.all([
            prisma.deal.count({ where: { isActive: true } }),
            prisma.deal.count({ where: { isActive: false } })
        ])

        // 4. Tickets Stats
        const [totalTickets, redeemedTickets] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { isUsed: true } })
        ])
        const conversionRate = totalTickets > 0 ? ((redeemedTickets / totalTickets) * 100).toFixed(1) : 0

        // 5. Revenue Calculation (Mock based on active partners)
        const revenue = (activeBusinesses * 120).toFixed(0) // Assuming 120 TND avg per partner

        // 6. City Distribution
        const cityGroups = await prisma.business.groupBy({
            by: ['city'],
            where: { status: 'ACTIVE' },
            _count: { city: true }
        })

        const cityDistribution = cityGroups.map(g => ({
            city: g.city,
            count: g._count.city
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        return NextResponse.json({
            users: {
                total: totalUsers,
                new: newUsers,
                growth: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0
            },
            businesses: {
                active: activeBusinesses,
                pending: pendingBusinesses,
                rejected: rejectedBusinesses,
                total: totalBusinesses
            },
            deals: {
                active: activeDeals,
                expired: expiredDeals
            },
            tickets: {
                total: totalTickets,
                redeemed: redeemedTickets,
                conversionRate: parseFloat(conversionRate as string)
            },
            revenue: parseFloat(revenue),
            cityDistribution
        })

    } catch (error) {
        console.error("Stats API Error:", error)
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }
}
