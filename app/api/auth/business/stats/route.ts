import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    if (!businessId) return NextResponse.json({ error: "No ID" }, { status: 400 })

    // Aggregate real data
    const deals = await prisma.deal.findMany({
      where: { businessId: businessId },
      select: { views: true, claimed: true, clicks: true }
    })

    const reach = deals.reduce((acc, d) => acc + (d.views || 0), 0)
    const redemptions = deals.reduce((acc, d) => acc + (d.claimed || 0), 0)
    const clicks = deals.reduce((acc, d) => acc + (d.clicks || 0), 0)
<<<<<<< HEAD

    // Recent Redemptions
    const recentActivity = await prisma.redemption.findMany({
      where: { deal: { businessId: businessId } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } },
        deal: { select: { title: true } }
      }
    })

    const formattedActivity = recentActivity.map(r => ({
      id: r.id,
      user: r.user.fullName,
      deal: r.deal.title,
      time: r.createdAt
    }))
=======
>>>>>>> 593adec7bd95406e859f20f7aa9a8b1f3d69d5af

    return NextResponse.json({
      success: true,
      stats: { reach, clicks, redemptions },
      recentActivity: formattedActivity
    })
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}