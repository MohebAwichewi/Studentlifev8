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
    // 1. Fetch real counts from the database
    const totalRevenue = 0 // Placeholder for now

    // ✅ FIX 2: Check for 'ACTIVE', not 'APPROVED'
    const livePartners = await prisma.business.count({
      where: { status: 'ACTIVE' }
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
    const revenue = (activeBusinesses * 120).toFixed(0)

    // 6. Activity Feed - Recent Redemptions
    const recentRedemptions = await prisma.redemption.findMany({
      take: 10,
    // Pending Verifications Count (Students who uploaded ID but not yet verified)
    const pendingVerifications = await prisma.student.count({
      where: {
        isVerified: false,
        idCardUrl: { not: null }
      }
    })

    // Redemptions Today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const redemptionsToday = await prisma.redemption.count({
      where: {
        createdAt: { gte: today }
      }
    })

    // 2. Fetch recent applications (Pending ones)
    const recentApplications = await prisma.business.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { businessName: true } },
        deal: { select: { title: true } }
      }
    })

    // 7. Activity Feed - Recent Registrations
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true }
    })

    const redemptionsActivity = recentRedemptions.map(r => ({
      type: 'redemption',
      business: r.business?.businessName || 'Unknown',
      deal: r.deal?.title || 'Unknown Deal',
      timestamp: r.createdAt
    }))

    const registrationsActivity = recentUsers.map(u => ({
      type: 'registration',
      user: u.name,
      timestamp: u.createdAt
    }))

    return NextResponse.json({
      success: true,
      stats: {
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
        revenue: parseFloat(revenue)
        revenue: `£${totalRevenue}`,
        livePartners,
        pendingRequests,
        activeStudents,
        pendingVerifications,
        redemptionsToday
      },
      activity: {
        redemptions: redemptionsActivity,
        registrations: registrationsActivity
      }
    })

  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch stats"
    }, { status: 500 })
  }
}
