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
      select: { views: true, claimed: true }
    })

    const reach = deals.reduce((acc, d) => acc + (d.views || 0), 0)
    const redemptions = deals.reduce((acc, d) => acc + (d.claimed || 0), 0)
    const clicks = Math.round(reach * 0.12) // Approximate clicks if not tracked directly

    return NextResponse.json({
      success: true,
      stats: { reach, clicks, redemptions }
    })
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}